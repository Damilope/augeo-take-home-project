import {EnvVarNames} from './constants';
import {AppVariables} from './types';
import {appVariablesJoiSchema, validateDataWithJoiSchema} from './validation';

export function extractAppVariables(): AppVariables {
  const dbName = process.env[EnvVarNames.DBName];
  const initializationDataJsonFilePath =
    process.env[EnvVarNames.InitializationDataJsonFilePath];
  const port = process.env[EnvVarNames.Port];
  return validateDataWithJoiSchema(appVariablesJoiSchema, {
    dbName,
    initializationDataJsonFilePath,
    port,
  });
}
