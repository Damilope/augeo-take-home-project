import * as Joi from 'joi';
import {appConstants, EnvironmentVarNames} from './constants';
import {
  AppInitializationData,
  AppVariables,
  Department,
  Person,
  QueryByIDParams,
  UpdateDepartmentInput,
  UpdateDepartmentParams,
  UpdatePersonInput,
  UpdatePersonParams,
} from './types';

const id = Joi.string().guid();
const departmentName = Joi.string().max(appConstants.maxNameLength);
const personName = Joi.string().max(appConstants.maxNameLength);
const jobTitle = Joi.string().max(appConstants.maxNameLength);
const idRequired = id.required();
const departmentNameRequired = departmentName.required();
const personNameRequired = personName.required();
const jobTitleRequired = jobTitle.required();

export const departmentJoiSchema = Joi.object<Department>().keys({
  id: idRequired,
  name: departmentNameRequired,
});

export const personJoiSchema = Joi.object<Person>().keys({
  id: idRequired,
  departmentId: idRequired,
  managerId: id,
  firstName: personNameRequired,
  lastName: personNameRequired,
  jobTitle: jobTitleRequired,
});

export const updateDepartmentInputJoiSchema =
  Joi.object<UpdateDepartmentInput>().keys({
    name: departmentName,
  });

export const updatePersonInputJoiSchema = Joi.object<UpdatePersonInput>().keys({
  departmentId: id,
  managerId: id,
  firstName: personName,
  lastName: personName,
  jobTitle: jobTitle,
});

export const queryByIdJoiSchema = Joi.object<QueryByIDParams>().keys({
  id,
});

export const updatePersonParamsJoiSchema =
  Joi.object<UpdatePersonParams>().keys({
    id,
    person: updatePersonInputJoiSchema.required(),
  });

export const updateDepartmentParamsJoiSchema =
  Joi.object<UpdateDepartmentParams>().keys({
    id,
    department: updateDepartmentInputJoiSchema.required(),
  });

export const appInitializationDataJoiSchema =
  Joi.object<AppInitializationData>().keys({
    departments: Joi.array().items(departmentJoiSchema).required(),
    people: Joi.array().items(personJoiSchema).required(),
  });

export const appVariablesJoiSchema = Joi.object<AppVariables>().keys({
  initializationDataJsonFilePath: Joi.string()
    .required()
    .label(EnvironmentVarNames.InitializationDataJsonFilePath),
  port: Joi.number()
    .integer()
    .positive()
    .required()
    .label(EnvironmentVarNames.Port),
});

export function validateDataWithJoiSchema<T>(
  schema: Joi.Schema<T>,
  data: unknown,
  options?: Joi.ValidationOptions
) {
  const {value, error} = schema.validate(data, {
    abortEarly: false,
    convert: true,
    allowUnknown: false,
    ...options,
  });

  if (error) {
    throw error;
  }

  return value;
}
