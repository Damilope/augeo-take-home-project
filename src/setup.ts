import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import {readFileSync} from 'fs';
import {extractAppVariables} from './applicationVariables';
import {
  getDepartment,
  getPerson,
  getPersonDepartment,
  getPersonManager,
  getPersonReports,
  listDepartmentPeople,
  listDepartments,
  listPeople,
  updateDepartment,
  updatePerson,
} from './endpoints';
import {typeDefs} from './graphSchema';
import {
  InMemoryDepartmentsDataLayer,
  InMemoryPeopleDataLayer,
} from './memoryDataLayers';
import {AppContext, AppInitializationData} from './types';
import {
  appInitializationDataJoiSchema,
  validateDataWithJoiSchema,
} from './validation';

/**
 * Loads the server's initialization data from
 * {@link AppVariables.initializationDataJsonFilePath}, validates it, and
 * returns it. The initialization data should follow the format
 * {@link AppInitializationData}.
 */
export function loadInitAppDataFromFile(context: AppContext) {
  const dataRaw = readFileSync(context.vars.initializationDataJsonFilePath, {
    encoding: 'utf-8',
  });
  const dataParsed = JSON.parse(dataRaw) as AppInitializationData;
  const value = validateDataWithJoiSchema(
    appInitializationDataJoiSchema,
    dataParsed
  );
  return value;
}

/**
 * Loads the server's initialization data from file and into DB.
 */
export async function loadInitAppDataIntoDB(context: AppContext) {
  const value = await loadInitAppDataFromFile(context);
  context.data.departments.insert(value.departments);
  context.data.people.insert(value.people);
}

/**
 * Iinitializes server context {@link AppContext}, and loads server
 * initialization data.
 */
export async function initAppContext(): Promise<AppContext> {
  const context: AppContext = {
    vars: extractAppVariables(),
    data: {
      departments: new InMemoryDepartmentsDataLayer(),
      people: new InMemoryPeopleDataLayer(),
      dispose: async () => {},
    },
  };
  await loadInitAppDataIntoDB(context);
  return context;
}

export async function startServer() {
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
    DepartmentWithRelationships: {
      people: listDepartmentPeople,
    },
    PersonWithRelationships: {
      manager: getPersonManager,
      department: getPersonDepartment,
      reports: getPersonReports,
    },
  };
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  const context = await initAppContext();
  const {url} = await startStandaloneServer(server, {
    listen: {port: context.vars.port},
    context: () => Promise.resolve(context),
  });

  console.log(`🚀  Server ready at: ${url}`);
}
