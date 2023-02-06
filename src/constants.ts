export const EnvVarNames = {
  DBName: 'DB_NAME',
  InitializationDataJsonFilePath: 'INITIALIZATION_DATA_JSON_FILE_PATH',
  Port: 'PORT',
} as const;

export const appConstants = {
  dbDepartmentsCollectionName: 'departments',
  dbPeopleCollectionName: 'people',
  dbAppStateCollectionName: 'application-state',
  dbAutoload: true,
  dbAutosave: true,
  dbAutosaveInterval: 4000,
};
