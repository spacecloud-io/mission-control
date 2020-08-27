import { removeDbConfig, loadDbConfig, loadDBConnState, addDatabase, enableDb, disableDb, changeDbName } from './config';
import { loadDbSchemas, inspectColSchema, saveColSchema, reloadDbSchema, modifyDbSchema } from './schema';
import { loadDbRules } from './rules';
import { loadDbPreparedQueries, savePreparedQueryConfig, deletePreparedQuery } from './preparedQuery';
import { saveColRealtimeEnabled, untrackCollection, deleteCollection } from './collections';

export default {
  removeDbConfig,
  loadDbConfig,
  loadDbSchemas,
  loadDbRules,
  loadDbPreparedQueries,
  loadDBConnState,
  inspectColSchema,
  saveColSchema,
  saveColRealtimeEnabled,
  untrackCollection,
  deleteCollection,
  savePreparedQueryConfig,
  deletePreparedQuery,
  reloadDbSchema,
  modifyDbSchema,
  addDatabase,
  enableDb,
  disableDb,
  changeDbName
}