import {appMessages} from './messages';
import {
  AppContext,
  Department,
  DepartmentWithRelationships,
  Person,
  PersonWithRelationships,
  QueryByIDParams,
  Resolver,
  UpdateDepartmentParams,
  UpdatePersonParams,
} from './types';
import {
  queryByIdJoiSchema,
  updateDepartmentParamsJoiSchema,
  updatePersonParamsJoiSchema,
  validateDataWithJoiSchema,
} from './validation';

/**
 * Returns a list of all departments in DB.
 */
export const listDepartments: Resolver<
  DepartmentWithRelationships[],
  undefined
> = async (parent, args, context) => {
  const departments = await context.data.departments.getItems();
  return departments.map(withDepartmentRelationships);
};

/**
 * Returns a single department by ID or `null` if the department does not exist.
 */
export const getDepartment: Resolver<
  DepartmentWithRelationships | null,
  QueryByIDParams
> = async (parent, args, context) => {
  const input = validateDataWithJoiSchema(queryByIdJoiSchema, args);
  const department = await context.data.departments.getItemByField(
    'id',
    input.id
  );
  return withDepartmentRelationshipsOrNull(department);
};

/**
 * Returns a list of all people in DB.
 */
export const listPeople: Resolver<
  PersonWithRelationships[],
  undefined
> = async (parent, args, context) => {
  const people = await context.data.people.getItems();
  return people.map(withPersonRelationships);
};

/**
 * Returns a single person by ID or `null` if the person does not exist.
 */
export const getPerson: Resolver<
  PersonWithRelationships | null,
  QueryByIDParams
> = async (parent, args, context) => {
  const input = validateDataWithJoiSchema(queryByIdJoiSchema, args);
  const person = await context.data.people.getItemByField('id', input.id);
  return withPersonRelationshipsOrNull(person);
};

/**
 * Updates and returns a single department by ID or `null` if the department
 * does not exist.
 */
export const updateDepartment: Resolver<
  DepartmentWithRelationships | null,
  UpdateDepartmentParams
> = async (parent, args, context) => {
  const input = validateDataWithJoiSchema(
    updateDepartmentParamsJoiSchema,
    args
  );

  if (input.department.name) {
    await assertDepartmentNameIsAvailable(context, input.department.name);
  }

  const department = await context.data.departments.updateByField(
    'id',
    input.id,
    input.department
  );
  return withDepartmentRelationshipsOrNull(department);
};

/**
 * Updates and returns a single person by ID or `null` if the person
 * does not exist.
 */
export const updatePerson: Resolver<
  PersonWithRelationships | null,
  UpdatePersonParams
> = async (parent, args, context) => {
  const input = validateDataWithJoiSchema(updatePersonParamsJoiSchema, args);
  await Promise.all([
    // Check that department exists if `departmentId` is updated
    input.person.departmentId &&
      assertDepartmentExists(context, input.person.departmentId),

    // Check that manager exists if `managerId` is updated
    input.person.managerId &&
      assertPersonExists(
        context,
        input.person.managerId,
        appMessages.people.managerNotFound
      ),
  ]);
  const person = await context.data.people.updateByField(
    'id',
    input.id,
    input.person
  );
  return withPersonRelationshipsOrNull(person);
};

/**
 * Returns a list of people in a department. This resolver relies on the graph
 * haven fetched the department first, and the fetched department being
 * available as the parent of this node.
 */
export const listDepartmentPeople: Resolver<
  PersonWithRelationships[],
  undefined,
  Department
> = async (parent, args, context) => {
  const people = await context.data.people.getItemListByField(
    'departmentId',
    parent.id
  );
  return people.map(withPersonRelationships);
};

/**
 * Returns a list of people that report to a person. This resolver relies on the
 * graph haven fetched the person first, and the fetched person being available
 * as the parent of this node.
 */
export const getPersonReports: Resolver<
  PersonWithRelationships[],
  undefined,
  Person
> = async (parent, args, context) => {
  const people = await context.data.people.getItemListByField(
    'managerId',
    parent.id
  );
  return people.map(withPersonRelationships);
};

/**
 * Returns a person's manager if the person has one. This resolver relies on the
 * graph haven fetched the person first, and the fetched person being available
 * as the parent of this node.
 */
export const getPersonManager: Resolver<
  PersonWithRelationships | null,
  undefined,
  Person
> = async (parent, args, context) => {
  if (!parent.managerId) {
    return null;
  }

  const person = await context.data.people.getItemByField(
    'id',
    parent.managerId
  );
  return withPersonRelationshipsOrNull(person);
};

/**
 * Returns a person's department if the person has one. This resolver relies on the
 * graph haven fetched the person first, and the fetched person being available
 * as the parent of this node.
 */
export const getPersonDepartment: Resolver<
  DepartmentWithRelationships | null,
  undefined,
  Person
> = async (parent, args, context) => {
  const department = await context.data.departments.getItemByField(
    'id',
    parent.departmentId
  );
  return withDepartmentRelationshipsOrNull(department);
};

/**
 * Retrofits a person with resolvers for it's relationships.
 */
function withPersonRelationships(person: Person): PersonWithRelationships {
  return {
    ...person,
    department: getPersonDepartment,
    manager: getPersonManager,
    reports: getPersonReports,
  };
}

/**
 * Retrofits a person with resolvers for it's relationships or null if the
 * person does exist.
 */
function withPersonRelationshipsOrNull(
  person: Person | null
): PersonWithRelationships | null {
  if (person === null) {
    return person;
  }
  return withPersonRelationships(person);
}

/**
 * Retrofits a department with resolvers for it's relationships.
 */
function withDepartmentRelationships(
  department: Department
): DepartmentWithRelationships {
  return {
    ...department,
    people: listDepartmentPeople,
  };
}

/**
 * Retrofits a department with resolvers for it's relationships or null if the
 * department does exist.
 */
function withDepartmentRelationshipsOrNull(
  department: Department | null
): DepartmentWithRelationships | null {
  if (department === null) {
    return department;
  }
  return withDepartmentRelationships(department);
}

/**
 * Asserts that a department name is not taken. This method throws an `Error` if
 * the name is taken.
 */
async function assertDepartmentNameIsAvailable(
  context: AppContext,
  name: string
) {
  const departmentExists = await context.data.departments.getItemByRegex(
    'name',
    // Use regex to get around case-sensitivity
    new RegExp(name, 'i')
  );

  if (departmentExists) {
    throw new Error(appMessages.departments.departmentExists(name));
  }
}

/**
 * Asserts that a department exists. This method throws an `Error` if it does
 * not exist.
 */
async function assertDepartmentExists(context: AppContext, id: string) {
  const department = await context.data.departments.getItemByField('id', id);
  if (!department) {
    throw new Error(appMessages.departments.departmentNotFound);
  }
  return department;
}

/**
 * Asserts that a person exists. This method throws an `Error` if it does
 * not exist.
 */
async function assertPersonExists(
  context: AppContext,
  id: string,
  message = appMessages.people.personNotFound
) {
  const person = await context.data.people.getItemByField('id', id);
  if (!person) {
    throw new Error(message);
  }
  return person;
}
