import { set, get, del } from "automate-redux";
import client from "../client";
import store from "../store";
import { saveEventingConfig, getEventingDbAliasName } from "./eventing"
import { defaultDBRules, defaultPreparedQueryRule, dbTypes, configResourceTypes, permissionVerbs } from "../constants";
import { checkResourcePermissions } from "../utils";
import dotProp from "dot-prop-immutable";

export const loadDbConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.DB_CONFIG], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db config")
      setDbConfigs({})
      resolve()
      return
    }

    client.database.fetchDbConfig(projectId)
      .then((result = []) => {
        const dbConfigs = result.reduce((prev, curr) => {
          const dbAlias = curr.dbAlias ? curr.dbAlias : curr.type
          return Object.assign({}, prev, { [dbAlias]: curr })
        }, {})
        setDbConfigs(dbConfigs)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadDbSchemas = (projectId, dbAliasName = "*", colName = "*") => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.DB_SCHEMA], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db schema")
      setDbSchemas({})
      resolve()
      return
    }

    client.database.fetchDbSchemas(projectId, dbAliasName, colName)
      .then((result = []) => {
        const dbSchemas = Object.assign({}, getDbSchemas(store.getState()))
        const newDbSchemas = result.reduce((prev, curr) => {
          const { col, dbAlias, schema = "" } = curr
          return dotProp.set(prev, `${dbAlias}.${col}`, schema)
        }, dbSchemas)
        setDbSchemas(newDbSchemas)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadDbRules = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.DB_RULES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db rules")
      setDbRules({})
      resolve()
      return
    }

    client.database.fetchDbRules(projectId)
      .then((result = []) => {
        const dbRules = Object.assign({}, getDbRules(store.getState()))
        const newDbRules = result.reduce((prev, curr) => {
          const { col, dbAlias, ...rules } = curr
          return dotProp.set(prev, `${dbAlias}.${col}`, rules)
        }, dbRules)
        setDbRules(newDbRules)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadDbPreparedQueries = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.DB_PREPARED_QUERIES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db prepared queries")
      setDbPreparedQueries({})
      resolve()
      return
    }

    client.database.fetchDbPreparedueries(projectId)
      .then((result = []) => {
        const dbPreparedQueries = result.reduce((prev, curr) => {
          const { id, dbAlias, ...preparedQueryConfig } = curr

          // Make sure that prepared query object has id in it
          const newPreparedQueryConfig = Object.assign({}, preparedQueryConfig, { id })

          const dbPreparedQuery = prev[dbAlias]
          if (dbPreparedQuery) {
            const newDbPreparedQuery = Object.assign({}, dbPreparedQuery)
            newDbPreparedQuery[id] = newPreparedQueryConfig
            return Object.assign({}, prev, { [dbAlias]: newDbPreparedQuery })
          }

          return Object.assign({}, prev, { [dbAlias]: { [id]: newPreparedQueryConfig } })
        }, {})
        setDbPreparedQueries(dbPreparedQueries)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

const loadCollections = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.listCollections(projectId, dbAliasName)
      .then((collections = []) => {
        setDbCollections(dbAliasName, collections)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadDBConnState = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.getConnectionState(projectId, dbAliasName)
      .then(connected => {
        setDbConnState(dbAliasName, connected)
        if (connected) {
          loadCollections(projectId, dbAliasName)
            .then(() => resolve(connected))
            .catch(ex => reject(ex))
          return
        }
        resolve(connected)
      })
      .catch(ex => reject(ex))
  })
}

export const inspectColSchema = (projectId, dbAliasName, colName) => {
  return new Promise((resolve, reject) => {
    client.database.inspectColSchema(projectId, dbAliasName, colName)
      .then(({ queued }) => {
        if (!queued) {
          loadDbSchemas(projectId, dbAliasName, colName)
            .then(() => resolve({ queued }))
            .catch(ex => reject(ex))
          return
        }

        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveColSchema = (projectId, dbAliasName, colName, schema) => {
  return new Promise((resolve, reject) => {
    client.database.modifyColSchema(projectId, dbAliasName, colName, schema)
      .then(({ queued }) => {
        if (!queued) {
          setDbSchema(dbAliasName, colName, schema)
          const dbCollections = getCollections(store.getState(), dbAliasName)
          if (!dbCollections.some(col => col === colName)) {
            const newDbCollections = [...dbCollections, colName]
            setDbCollections(dbAliasName, newDbCollections)
          }
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveColRule = (projectId, dbAliasName, colName, securityRules, isRealtimeEnabled) => {
  return new Promise((resolve, reject) => {
    const collectionRules = { rules: securityRules, isRealtimeEnabled }
    client.database.setColRule(projectId, dbAliasName, colName, collectionRules)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`dbRules.${dbAliasName}.${colName}`, collectionRules))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveColRealtimeEnabled = (projectId, dbAliasName, colName, isRealtimeEnabled) => {
  return new Promise((resolve, reject) => {
    const collectionRules = getCollectionRules(store.getState(), dbAliasName, colName)
    const newCollectionRules = Object.assign({}, collectionRules, { isRealtimeEnabled })
    client.database.setColRule(projectId, dbAliasName, colName, newCollectionRules)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`dbRules.${dbAliasName}.${colName}.isRealtimeEnabled`, isRealtimeEnabled))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveColCachingEnabled = (projectId, dbAliasName, colName, enableCacheInvalidation) => {
  return new Promise((resolve, reject) => {
    const collectionRules = getCollectionRules(store.getState(), dbAliasName, colName)
    const newCollectionRules = Object.assign({}, collectionRules, { enableCacheInvalidation })
    client.database.setColRule(projectId, dbAliasName, colName, newCollectionRules)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`dbRules.${dbAliasName}.${colName}.enableCacheInvalidation`, enableCacheInvalidation))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveColSecurityRules = (projectId, dbAliasName, colName, securityRules) => {
  return new Promise((resolve, reject) => {
    const collectionRules = getCollectionRules(store.getState(), dbAliasName, colName)
    const newCollectionRules = Object.assign({}, collectionRules, { rules: securityRules })
    client.database.setColRule(projectId, dbAliasName, colName, newCollectionRules)
      .then(({ queued }) => {
        if (!queued) {
          setColSecurityRule(dbAliasName, colName, securityRules)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const untrackCollection = (projectId, dbAliasName, colName) => {
  return new Promise((resolve, reject) => {
    client.database.untrackCollection(projectId, dbAliasName, colName)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(del(`dbSchemas.${dbAliasName}.${colName}`))
          store.dispatch(del(`dbRules.${dbAliasName}.${colName}`))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteCollection = (projectId, dbAliasName, colName) => {
  return new Promise((resolve, reject) => {
    client.database.deleteCol(projectId, dbAliasName, colName)
      .then(({ queued }) => {
        if (!queued) {
          const collectionsList = get(store.getState(), `dbCollections.${dbAliasName}`, [])
          const newCollectionsList = collectionsList.filter(col => col !== colName)

          store.dispatch(del(`dbSchemas.${dbAliasName}.${colName}`))
          store.dispatch(del(`dbRules.${dbAliasName}.${colName}`))
          store.dispatch(set(`dbCollections.${dbAliasName}`, newCollectionsList))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const savePreparedQueryConfig = (projectId, dbAliasName, id, args, sql) => {
  return new Promise((resolve, reject) => {
    const preparedQueryConfig = getDbPreparedQuery(store.getState(), dbAliasName, id)
    const config = Object.assign({}, preparedQueryConfig, { sql, args })
    client.database.setPreparedQuery(projectId, dbAliasName, id, config)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`dbPreparedQueries.${dbAliasName}.${id}`, config))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const savePreparedQuerySecurityRule = (projectId, dbAliasName, id, rule) => {
  return new Promise((resolve, reject) => {
    const preparedQueryConfig = getDbPreparedQuery(store.getState(), dbAliasName, id)
    const config = Object.assign({}, preparedQueryConfig, { rule })
    client.database.setPreparedQuery(projectId, dbAliasName, id, config)
      .then(({ queued }) => {
        if (!queued) {
          setPreparedQueryRule(dbAliasName, id, rule)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deletePreparedQuery = (projectId, dbAliasName, id) => {
  return new Promise((resolve, reject) => {
    client.database.deletePreparedQuery(projectId, dbAliasName, id)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(del(`dbPreparedQueries.${dbAliasName}.${id}`))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const reloadDbSchema = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.reloadSchema(projectId, dbAliasName)
      .then(({ queued }) => {
        if (!queued) {
          loadDbSchemas(projectId, dbAliasName)
            .then(() => resolve({ queued }))
            .catch(ex => reject(ex))
          return
        }

        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const modifyDbSchema = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    const dbSchemas = getDbSchema(store.getState(), dbAliasName)
    const dbSchemaRequest = Object.entries(dbSchemas).reduce((prev, curr) => {
      const [colName, schema] = curr
      return Object.assign({}, prev, { [colName]: { schema } })
    }, {})
    client.database.modifySchema(projectId, dbAliasName, dbSchemaRequest)
      .then(({ queued }) => resolve({ queued }))
      .catch(ex => reject(ex))
  })
}

const saveDbConfig = (projectId, dbAliasName, dbConfig) => {
  return new Promise((resolve, reject) => {
    client.database.setDbConfig(projectId, dbAliasName, dbConfig)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`dbConfigs.${dbAliasName}`, dbConfig))
          loadDBConnState(projectId, dbAliasName)
            .then(connected => resolve({ connected }))
            .catch(ex => reject(ex))
        } else {
          resolve({ queued: true })
        }
      })
      .catch(ex => reject(ex))
  })
}

export const addDatabase = (projectId, dbAliasName, dbType, dbName, conn) => {
  return new Promise((resolve, reject) => {
    const state = store.getState()
    const dbConfigs = getDbConfigs(state)
    saveDbConfig(projectId, dbAliasName, { enabled: true, conn: conn, type: dbType, name: dbName, limit: 1000 })
      .then(({ queued }) => {
        resolve({ queued })

        // Set default security rules for collections and prepared queries in the background
        const hasPermissionToSaveRule = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.DB_RULES], permissionVerbs.MODIFY)
        if (hasPermissionToSaveRule) {
          saveColRule(projectId, dbAliasName, "default", defaultDBRules, false)
            .catch(ex => console.error("Error setting default collection rule" + ex.toString()))
        }

        const hasPermissionToCreatePrepareduery = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.DB_PREPARED_QUERIES], permissionVerbs.MODIFY)
        if (hasPermissionToCreatePrepareduery) {
          if (isPreparedQueriesSupportedForDbType(dbType)) {
            savePreparedQuerySecurityRule(projectId, dbAliasName, "default", defaultPreparedQueryRule)
              .catch(ex => console.error("Error setting default prepared query rule" + ex.toString()))
          }
        }
      })
      .catch(ex => reject(ex))
  })
}

export const enableDb = (projectId, dbAliasName, conn) => {
  return new Promise((resolve, reject) => {
    const dbConfig = getDbConfig(store.getState(), dbAliasName)
    saveDbConfig(projectId, dbAliasName, Object.assign({}, dbConfig, { enabled: true, conn }))
      .then(({ queued, connected }) => resolve({ queued, connected }))
      .catch(ex => reject(ex))
  })
}

export const disableDb = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    const dbConfig = getDbConfig(store.getState(), dbAliasName)
    saveDbConfig(projectId, dbAliasName, Object.assign({}, dbConfig, { enabled: false }))
      .then(({ queued }) => resolve({ queued }))
      .catch(ex => reject(ex))
  })
}

export const removeDbConfig = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.removeDbConfig(projectId, dbAliasName)
      .then(({ queued }) => {

        if (!queued) {
          store.dispatch(del(`dbConfigs.${dbAliasName}`))
          store.dispatch(del(`dbSchemas.${dbAliasName}`))
          store.dispatch(del(`dbRules.${dbAliasName}`))
          store.dispatch(del(`dbPreparedQueries.${dbAliasName}`))
        }

        // Disable eventing if the removed db is eventing db
        const hasPermissionToConfigureEventing = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.EVENTING_CONFIG], permissionVerbs.MODIFY)
        if (hasPermissionToConfigureEventing) {
          const eventingDB = getEventingDbAliasName(store.getState())
          if (dbAliasName === eventingDB) {
            saveEventingConfig(projectId, false, "")
              .then(({ queued }) => resolve({ queued, disabledEventing: true }))
              .catch(ex => reject(ex))
            return
          }
        }
        resolve({ queued, disabledEventing: false })
      })
      .catch(ex => reject(ex))
  })
}

export const changeDbName = (projectId, dbAliasName, dbName) => {
  return new Promise((resolve, reject) => {
    const dbConfig = getDbConfig(store.getState(), dbAliasName)
    saveDbConfig(projectId, dbAliasName, Object.assign({}, dbConfig, { name: dbName }))
      .then(() => {
        const hasPermissionToChangeSchema = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.DB_SCHEMA], permissionVerbs.MODIFY)
        if (!hasPermissionToChangeSchema) {
          resolve()
          return
        }
        modifyDbSchema(projectId, dbAliasName)
          .then(({ queued }) => resolve({ queued }))
          .catch(ex => reject(ex))
      })
      .catch(ex => reject(ex))
  })
}

export const changeLimitClause = (projectId, dbAliasName, limit) => {
  return new Promise((resolve, reject) => {
    const dbConfig = getDbConfig(store.getState(), dbAliasName)
    saveDbConfig(projectId, dbAliasName, Object.assign({}, dbConfig, { limit }))
      .then(({ queued }) => resolve({ queued }))
      .catch(ex => reject(ex))
  })
}

export const changeDriverConfig = (projectId, dbAliasName, driverConfig) => {
  return new Promise((resolve, reject) => {
    const dbConfig = getDbConfig(store.getState(), dbAliasName)
    saveDbConfig(projectId, dbAliasName, Object.assign({}, dbConfig, { driverConf: driverConfig }))
      .then(({ queued }) => resolve({ queued }))
      .catch(ex => reject(ex))
  })
}

// Getters
export const getDbConfigs = (state) => get(state, "dbConfigs", {})
export const getDbConfig = (state, dbAliasName) => get(state, `dbConfigs.${dbAliasName}`, {})
export const getDbName = (state, projectId, dbAliasName) => get(getDbConfig(state, dbAliasName), "name", projectId)
export const getLimitClause = (state, dbAliasName) => get(getDbConfig(state, dbAliasName), "limit")
export const getDriverConfig = (state, dbAliasName) => get(getDbConfig(state, dbAliasName), "driverConf")
export const getDbType = (state, dbAliasName) => get(getDbConfig(state, dbAliasName), "type", dbAliasName)
export const getDbConnState = (state, dbAliasName) => get(state, `dbConnState.${dbAliasName}`, false)
export const getCollectionSchema = (state, dbAliasName, colName) => get(state, `dbSchemas.${dbAliasName}.${colName}`, "")
export const getDbSchema = (state, dbAliasName) => get(state, `dbSchemas.${dbAliasName}`, {})
export const getDbSchemas = (state) => get(state, "dbSchemas", {})
export const getDbRules = (state, dbAliasName) => get(state, `dbRules.${dbAliasName}`, {})
export const getDbPreparedQueries = (state, dbAliasName) => get(state, `dbPreparedQueries.${dbAliasName}`, {})
export const getDbPreparedQuery = (state, dbAliasName, preparedQueryId) => get(state, `dbPreparedQueries.${dbAliasName}.${preparedQueryId}`, { id: preparedQueryId, sql: "", args: [], rule: {} })
export const getDbDefaultPreparedQuerySecurityRule = (state, dbAliasName) => get(state, `dbPreparedQueries.${dbAliasName}.default.rule`, {})
export const getDbDefaultCollectionSecurityRule = (state, dbAliasName) => get(state, `dbRules.${dbAliasName}.default.rules`, {})
export const getCollections = (state, dbAliasName) => {
  const collections = get(state, `dbCollections.${dbAliasName}`, [])
  const schemas = Object.keys(getDbSchema(state, dbAliasName))
  const rules = Object.keys(getDbRules(state, dbAliasName))
  const allCollections = [...new Set([...collections, ...schemas, ...rules])]
  return allCollections
}
export const getTrackedCollectionsInfo = (state, dbAliasName) => {
  const schemas = getDbSchema(state, dbAliasName)
  const rules = getDbRules(state, dbAliasName)
  const collections = {}
  Object.entries(schemas).forEach(([colName, schema]) => {
    collections[colName] = { schema }
  })
  Object.entries(rules).forEach(([colName, rule]) => {
    if (collections[colName]) {
      collections[colName].rule = rule
    } else {
      collections[colName] = { rule }
    }
  })
  const collectionsInfo = Object.entries(collections).map(([colName, { schema, rule }]) => Object.assign({}, { name: colName, schema, ...rule }))
  return collectionsInfo.filter(({ name }) => name !== "default" && name !== "invocation_logs" && name !== "event_logs")
}

export const getTrackedCollections = (state, dbAliasName) => {
  const schemas = getDbSchema(state, dbAliasName)
  const rules = getDbRules(state, dbAliasName)
  const collections = [...new Set([...Object.keys(schemas), ...Object.keys(rules)])]
  return collections.filter(col => col !== "default" && col !== "invocation_logs" && col !== "event_logs")
}

export const getDbGraphQLRootFields = (state, dbAliasName) => {
  const schemas = getDbSchema(state, dbAliasName)
  const rules = getDbRules(state, dbAliasName)
  const preparedQueries = getDbPreparedQueries(state, dbAliasName)
  return [...new Set([...Object.keys(schemas), ...Object.keys(rules), ...Object.keys(preparedQueries)])]
}

export const getUntrackedCollections = (state, dbAliasName) => {
  const schemas = getDbSchema(state, dbAliasName)
  const rules = getDbRules(state, dbAliasName)
  const collections = getCollections(state, dbAliasName)
  const untrackedCollections = collections.filter(col => !schemas[col] && schemas[col] !== "" && !rules[col] && col !== "default" && col !== "invocation_logs" && col !== "event_logs")
  return untrackedCollections
}

export const getDbConnectionString = (state, dbAliasName) => get(getDbConfig(state, dbAliasName), "conn", "")
export const getCollectionRules = (state, dbAliasName, colName) => get(state, `dbRules.${dbAliasName}.${colName}`, { isRealtimeEnabled: false, rules: {} })
export const getCollectionSecurityRule = (state, dbAliasName, colName) => get(state, `dbRules.${dbAliasName}.${colName}.rules`, {})
export const getPreparedQuerySecurityRule = (state, dbAliasName, id) => get(state, `dbPreparedQueries.${dbAliasName}.${id}.rule`, {})
export const isPreparedQueriesSupported = (state, dbAliasName) => {
  const dbType = getDbType(state, dbAliasName)
  return isPreparedQueriesSupportedForDbType(dbType)
}

export const isPreparedQueriesSupportedForDbType = (dbType) => {
  return [dbTypes.POSTGRESQL, dbTypes.MYSQL, dbTypes.SQLSERVER].some(value => value === dbType)
}
export const setPreparedQueryRule = (dbAliasName, id, rule) => store.dispatch(set(`dbPreparedQueries.${dbAliasName}.${id}.rule`, rule))
export const setColSecurityRule = (dbAliasName, colName, rule) => store.dispatch(set(`dbRules.${dbAliasName}.${colName}.rules`, rule))
export const setDbCollections = (dbAliasName, collections) => store.dispatch(set(`dbCollections.${dbAliasName}`, collections))
const setDbConfigs = (dbConfigs) => store.dispatch(set("dbConfigs", dbConfigs))
const setDbSchemas = (dbSchemas) => store.dispatch(set("dbSchemas", dbSchemas))
const setDbSchema = (dbAliasName, colName, schema) => store.dispatch(set(`dbSchemas.${dbAliasName}.${colName}`, schema))
const setDbRules = (dbRules) => store.dispatch(set("dbRules", dbRules))
const setDbPreparedQueries = (dbPreparedQueries) => store.dispatch(set("dbPreparedQueries", dbPreparedQueries))
const setDbConnState = (dbAliasName, connected) => store.dispatch(set(`dbConnState.${dbAliasName}`, connected))