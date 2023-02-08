import {GraphQLResolveInfo} from 'graphql';

export interface IResource {
  id: string;
}

export interface Department extends IResource {
  name: string;
}

export interface Person extends IResource {
  firstName: string;
  lastName: string;
  jobTitle: string;
  departmentId: string;
  managerId?: string;
}

export interface DepartmentWithRelationships extends Department {
  people: Resolver<PersonWithRelationships[], undefined, Department>;
}

export interface PersonWithRelationships extends Person {
  manager: Resolver<PersonWithRelationships | null, undefined, Person>;
  reports: Resolver<PersonWithRelationships[], undefined, Person>;
  department: Resolver<DepartmentWithRelationships | null, undefined, Person>;
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
  initializationDataJsonFilePath: string;
  port: number;
}

type OrPromise<T> = T | Promise<T>;
type IsStringField<T, K extends keyof T> = T[K] extends string ? K : never;

/**
 * Extracts the string fields of type `T`
 */
export type StringFields<T> = {
  [K in keyof T]: IsStringField<T, K>;
}[keyof T];

/**
 * An abstraction over the server's data to allow for easy switching of
 * underlying data provider without drastic changes to code that consume data.
 * It'll also allow for easy mocking of data layer for tests and other
 * environments.
 */
export interface ResourceDataLayer<T> {
  insert(items: T[]): OrPromise<void>;
  getItems(): OrPromise<T[]>;
  getItemByField<K extends keyof T>(field: K, value: T[K]): OrPromise<T | null>;
  getItemListByField<K extends keyof T>(field: K, value: T[K]): OrPromise<T[]>;
  getItemByRegex<K extends StringFields<T>>(
    field: K,
    value: RegExp
  ): OrPromise<T | null>;
  updateByField<K extends keyof T>(
    field: K,
    value: T[K],
    update: Partial<T>
  ): OrPromise<T | null>;
}

export type DepartmentsDataLayer = ResourceDataLayer<Department>;
export type PeopleDataLayer = ResourceDataLayer<Person>;

export interface DataLayer {
  departments: DepartmentsDataLayer;
  people: PeopleDataLayer;
  dispose(): Promise<void>;
}

export interface AppContext {
  vars: AppVariables;
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
