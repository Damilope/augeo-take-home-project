import {GraphQLResolveInfo} from 'graphql';
import type * as LokiDB from 'lokijs';

export interface Department {
  name: string;
  id: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  departmentId: string;
  managerId?: string;
}

export interface DepartmentWithRelationships extends Department {
  people?: Person[];
}

export interface PersonWithRelationships extends Person {
  manager?: Person;
  reports?: Person[];
  department?: Department;
}

export interface AppState {
  isDataLoaded?: boolean;
}

export interface UpdateDepartmentInput {
  name?: string;
}

export interface UpdatePersonInput {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  departmentId?: string;
  managerId?: string;
}

export interface QueryByIDParams {
  id: string;
}

export interface UpdateDepartmentParams extends QueryByIDParams {
  department: UpdateDepartmentInput;
}

export interface UpdatePersonParams extends QueryByIDParams {
  person: UpdatePersonInput;
}

export interface AppVariables {
  dbName: string;
  initializationDataJsonFilePath: string;
  port: number;
}

export interface LokiDBAndCollections {
  db: LokiDB;
  departments: LokiDB.Collection<Department>;
  people: LokiDB.Collection<Person>;
  appState: LokiDB.Collection<AppState>;
}

export interface DepartmentDataLayer {
  getDepartments(): Promise<Department[]>;
  getDepartmentById(id: string): Promise<Department | null>;
  updateDepartmentById(
    id: string,
    update: Partial<Department>
  ): Promise<Department | null>;
}

export interface PersonDataLayer {
  getPeople(): Promise<Person[]>;
  getPersonById(id: string): Promise<Person | null>;
  updatePersonById(id: string, update: Partial<Person>): Promise<Person | null>;
}

export interface DataLayer {
  department: DepartmentDataLayer;
  person: PersonDataLayer;
}

export interface AppContext {
  vars: AppVariables;
  db: LokiDBAndCollections;
  data: DataLayer;
}

export interface AppInitializationData {
  departments: Department[];
  people: Person[];
}

export type Resolver<Returns, Args, Parent = undefined> = (
  parent: Parent,
  args: Args,
  context: AppContext,
  info: GraphQLResolveInfo
) => Returns | Promise<Returns>;
