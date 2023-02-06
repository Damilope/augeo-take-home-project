import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import {readFileSync} from 'fs';
import * as LokiDB from 'lokijs';
import {extractAppVariables} from './applicationVariables';
import {appConstants} from './constants';
import {
  getDepartment,
  getPerson,
  listDepartments,
  listPeople,
  updateDepartment,
  updatePerson,
} from './endpoints';
import {typeDefs} from './graphSchema';
import {
  AppContext,
  AppInitializationData,
  AppState,
  AppVariables,
  Department,
  LokiDBAndCollections,
  Person,
} from './types';
import {
  appInitializationDataJoiSchema,
  validateDataWithJoiSchema,
} from './validation';

function initDB(vars: AppVariables) {
  return new Promise<LokiDBAndCollections>((resolve, reject) => {
    const db = new LokiDB(vars.dbName, {
      autoloadCallback: initializeCollections,
      autoload: appConstants.dbAutoload,
      autosave: appConstants.dbAutosave,
      autosaveInterval: appConstants.dbAutosaveInterval,
    });

    function initializeCollections(error: unknown) {
      if (error) {
        reject(error);
        return;
      }

      const departments = initDBCollection<Department>(
        db,
        appConstants.dbDepartmentsCollectionName
      );
      const people = initDBCollection<Person>(
        db,
        appConstants.dbPeopleCollectionName
      );
      const appState = initDBCollection<AppState>(
        db,
        appConstants.dbAppStateCollectionName
      );
      resolve({db, departments, people, appState});
    }

    function initDBCollection<T extends object>(db: LokiDB, name: string) {
      let collection = db.getCollection<T>(name);
      if (collection === null) {
        collection = db.addCollection<T>(name);
      }
      return collection;
    }
  });
}

/**
 * Loads JSON data from the {@link AppVariables.initializationDataJsonFilePath}
 * provided if there isn't an existing app state doc with
 * {@link AppState.isDataLoaded} set to true. This makes sure that data is not
 * loaded if it's already loaded, though there are places where it falls short:
 * - Because it sets app state after data is loaded, if any error occurs when
 *   data is loaded into DB preventing setting app state, but some data is
 *   already loaded, there's be data duplicated in DB. This can be solved by
 *   clearing DB if there isn't app state.
 * - If we want to add new people or departments using the same file hoping
 *   they'll be added to DB when the application starts, that will not work if
 *   app state is already set.
 */
async function loadAppDataIntoDB(context: AppContext) {
  const appState = context.db.appState.findOne({isDataLoaded: true});
  const isDataLoaded = appState?.isDataLoaded;
  if (isDataLoaded) {
    return;
  }

  const dataRaw = readFileSync(context.vars.initializationDataJsonFilePath, {
    encoding: 'utf-8',
  });
  const dataParsed = JSON.parse(dataRaw) as AppInitializationData;
  const value = validateDataWithJoiSchema(
    appInitializationDataJoiSchema,
    dataParsed
  );
  context.db.departments.insert(value.departments);
  context.db.people.insert(value.people);
  context.db.appState.insert({isDataLoaded: true});
}

async function initContext(): Promise<AppContext> {
  const vars = extractAppVariables();
  const db = await initDB(vars);
  const context: AppContext = {db, vars};
  await loadAppDataIntoDB(context);
  return context;
}

async function startServer() {
  const resolvers = {
    Query: {
      departments: listDepartments,
      department: getDepartment,
      people: listPeople,
      person: getPerson,
    },
    Mutation: {
      updateDepartment,
      updatePerson,
    },
  };
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  const context = await initContext();
  const {url} = await startStandaloneServer(server, {
    listen: {port: context.vars.port},
    context: () => Promise.resolve(context),
  });

  console.log(`🚀  Server ready at: ${url}`);
}

startServer();
