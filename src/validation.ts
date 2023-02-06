import * as Joi from 'joi';
import {EnvVarNames} from './constants';
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

export const departmentJoiSchema = Joi.object<Department>().keys({
  id: Joi.string().guid().required(),
  name: Joi.string().required(),
});
export const personJoiSchema = Joi.object<Person>().keys({
  id: Joi.string().guid().required(),
  departmentId: Joi.string().required(),
  managerId: Joi.string(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  jobTitle: Joi.string().required(),
});
export const updateDepartmentInputJoiSchema =
  Joi.object<UpdateDepartmentInput>().keys({
    name: Joi.string(),
  });
export const updatePersonInputJoiSchema = Joi.object<UpdatePersonInput>().keys({
  departmentId: Joi.string().required(),
  managerId: Joi.string(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  jobTitle: Joi.string().required(),
});
export const queryByIdJoiSchema = Joi.object<QueryByIDParams>().keys({
  id: Joi.string().required(),
});
export const updatePersonParamsJoiSchema =
  Joi.object<UpdatePersonParams>().keys({
    id: Joi.string().required(),
    person: updatePersonInputJoiSchema.required(),
  });
export const updateDepartmentParamsJoiSchema =
  Joi.object<UpdateDepartmentParams>().keys({
    id: Joi.string().required(),
    department: updateDepartmentInputJoiSchema.required(),
  });
export const appInitializationDataJoiSchema =
  Joi.object<AppInitializationData>().keys({
    departments: Joi.array().items(departmentJoiSchema).required(),
    people: Joi.array().items(personJoiSchema).required(),
  });
export const appVariablesJoiSchema = Joi.object<AppVariables>().keys({
  dbName: Joi.string().required().label(EnvVarNames.DBName),
  initializationDataJsonFilePath: Joi.string()
    .required()
    .label(EnvVarNames.InitializationDataJsonFilePath),
  port: Joi.number().integer().positive().required().label(EnvVarNames.Port),
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
