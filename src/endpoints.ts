import {
  Department,
  Person,
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

export const listDepartments: Resolver<Department[], undefined> = async (
  parent,
  args,
  context,
  info
) => {
  return await context.data.department.getDepartments();
};

export const getDepartment: Resolver<
  Department | null,
  QueryByIDParams
> = async (parent, args, context, info) => {
  const input = validateDataWithJoiSchema(queryByIdJoiSchema, args);
  return context.data.department.getDepartmentById(input.id);
};

export const listPeople: Resolver<Person[], undefined> = async (
  parent,
  args,
  context,
  info
) => {
  return context.data.person.getPeople();
};

export const getPerson: Resolver<Person | null, QueryByIDParams> = async (
  parent,
  args,
  context,
  info
) => {
  const input = validateDataWithJoiSchema(queryByIdJoiSchema, args);
  return context.data.person.getPersonById(input.id);
};

export const updateDepartment: Resolver<
  Department | null,
  UpdateDepartmentParams
> = async (parent, args, context, info) => {
  const input = validateDataWithJoiSchema(
    updateDepartmentParamsJoiSchema,
    args
  );
  return context.data.department.updateDepartmentById(
    input.id,
    input.department
  );
};

export const updatePerson: Resolver<Person | null, UpdatePersonParams> = async (
  parent,
  args,
  context,
  info
) => {
  const input = validateDataWithJoiSchema(updatePersonParamsJoiSchema, args);
  return context.data.person.updatePersonById(input.id, input.person);
};
