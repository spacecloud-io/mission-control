import { removeConfig, loadConfig, loadDBConnState } from './config';
import { loadSchemas, inspectColSchema, saveColSchema } from './schema';
import { loadRules } from './rules';
import { loadPreparedQueries } from './preparedQuery';

export default {
  removeConfig,
  loadConfig,
  loadSchemas,
  loadRules,
  loadPreparedQueries,
  loadDBConnState,
  inspectColSchema,
  saveColSchema
}