import {EnvironmentVarNames} from './constants';
import {AppVariables} from './types';
import {appVariablesJoiSchema, validateDataWithJoiSchema} from './validation';

/**
 * Extracts and validates app variables from process env variables.
 */
export function extractAppVariables(): AppVariables {
  const initializationDataJsonFilePath =
    process.env[EnvironmentVarNames.InitializationDataJsonFilePath];
  const port = process.env[EnvironmentVarNames.Port];
  return validateDataWithJoiSchema(appVariablesJoiSchema, {
    initializationDataJsonFilePath,
    port,
  });
}
