import { set, get, del } from "automate-redux";
import client from "../client";
import store from "../store";
import { saveEventingConfig, getEventingDbAliasName } from "./eventing"
import { defaultDBRules, defaultPreparedQueryRule, dbTypes } from "../constants";

export const loadDbConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    client.database.fetchDbConfig(projectId)
      .then((result = []) => {
        const dbConfigs = result.reduce((prev, curr) => {
          const [dbAliasName, config] = Object.entries(curr)[0]
          return Object.assign({}, prev, { [dbAliasName]: config })
        }, {})
        store.dispatch(set("dbConfigs", dbConfigs))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadDbSchemas = (projectId) => {
  return new Promise((resolve, reject) => {
    client.database.fetchDbSchemas(projectId)
      .then((result = []) => {
        const map = result[0]
        const dbSchemas = Object.entries(map).reduce((prev, curr) => {
          const [key, value] = curr
          const [dbAliasName, colName] = key.split("-")
          const dbSchema = prev[dbAliasName]
          if (dbSchema) {
            const newDbSchema = Object.assign({}, dbSchema)
            newDbSchema[colName] = value.schema
            return Object.assign({}, prev, { [dbAliasName]: newDbSchema })
          }

          return Object.assign({}, prev, { [dbAliasName]: { [colName]: value.schema } })
        }, {})
        store.dispatch(set("dbSchemas", dbSchemas))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadDbRules = (projectId) => {
  return new Promise((resolve, reject) => {
    client.database.fetchDbRules(projectId)
      .then((result = []) => {
        const map = result[0]
        const dbRules = Object.entries(map).reduce((prev, curr) => {
          const [key, value] = curr
          const [dbAliasName, colName] = key.split("-")
          const dbRule = prev[dbAliasName]
          if (dbRule) {
            const newDbRule = Object.assign({}, dbRule)
            newDbRule[colName] = value
            return Object.assign({}, prev, { [dbAliasName]: newDbRule })
          }

          return Object.assign({}, prev, { [dbAliasName]: { [colName]: value } })
        }, {})
        store.dispatch(set("dbRules", dbRules))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadDbPreparedQueries = (projectId) => {
  return new Promise((resolve, reject) => {
    client.database.fetchDbPreparedueries(projectId)
      .then((result = []) => {
        const dbPreparedQueries = result.reduce((prev, curr) => {
          const { id, db, ...preparedQueryConfig } = curr
          const dbPreparedQuery = prev[db]
          if (dbPreparedQuery) {
            const newDbPreparedQuery = Object.assign({}, dbPreparedQuery)
            newDbPreparedQuery[id] = preparedQueryConfig
            return Object.assign({}, prev, { [db]: newDbPreparedQuery })
          }

          return Object.assign({}, prev, { [db]: { [id]: preparedQueryConfig } })
        }, {})
        store.dispatch(set("dbPreparedQueries", dbPreparedQueries))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

const loadCollections = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.listCollections(projectId, dbAliasName)
      .then((collections = []) => {
        store.dispatch(set(`dbCollections.${dbAliasName}`, collections))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadDBConnState = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.getConnectionState(projectId, dbAliasName)
      .then(connected => {
        store.dispatch(set(`dbConnState.${dbAliasName}`, connected))
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
      .then(schema => {
        store.dispatch(set(`dbSchemas.${dbAliasName}.${colName}`, schema))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveColSchema = (projectId, dbAliasName, colName, schema) => {
  return new Promise((resolve, reject) => {
    client.database.modifyColSchema(projectId, dbAliasName, colName, schema)
      .then(() => {
        store.dispatch(set(`dbSchemas.${dbAliasName}.${colName}`, schema))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveColRule = (projectId, dbAliasName, colName, securityRules, isRealtimeEnabled) => {
  return new Promise((resolve, reject) => {
    const collectionRules = { rules: securityRules, isRealtimeEnabled }
    client.database.setColRule(projectId, dbAliasName, colName, collectionRules)
      .then(() => {
        store.dispatch(set(`dbRules.${dbAliasName}.${colName}`, collectionRules))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveColRealtimeEnabled = (projectId, dbAliasName, colName, isRealtimeEnabled) => {
  return new Promise((resolve, reject) => {
    const collectionRules = getCollectionRules(store.getState(), dbAliasName, colName)
    const newCollectionRules = Object.assign({}, collectionRules, { isRealtimeEnabled })
    client.database.setColRule(projectId, dbAliasName, colName, newCollectionRules)
      .then(() => {
        store.dispatch(set(`dbRules.${dbAliasName}.${colName}.isRealtimeEnabled`, isRealtimeEnabled))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveColSecurityRules = (projectId, dbAliasName, colName, securityRules) => {
  return new Promise((resolve, reject) => {
    const collectionRules = getCollectionRules(store.getState(), dbAliasName, colName)
    const newCollectionRules = Object.assign({}, collectionRules, { rules: securityRules })
    client.database.setColRule(projectId, dbAliasName, colName, newCollectionRules)
      .then(() => {
        store.dispatch(set(`dbRules.${dbAliasName}.${colName}.rules`, securityRules))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const untrackCollection = (projectId, dbAliasName, colName) => {
  return new Promise((resolve, reject) => {
    client.database.untrackCollection(projectId, dbAliasName, colName)
      .then(() => {
        store.dispatch(del(`dbSchemas.${dbAliasName}.${colName}`))
        store.dispatch(del(`dbRules.${dbAliasName}.${colName}`))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteCollection = (projectId, dbAliasName, colName) => {
  return new Promise((resolve, reject) => {
    client.database.deleteCol(projectId, dbAliasName, colName)
      .then(() => {
        const collectionsList = get(store.getState(), `dbCollections.${dbAliasName}`, [])
        const newCollectionsList = collectionsList.filter(col => col !== colName)

        store.dispatch(del(`dbSchemas.${dbAliasName}.${colName}`))
        store.dispatch(del(`dbRules.${dbAliasName}.${colName}`))
        store.dispatch(set(`dbCollections.${dbAliasName}`, newCollectionsList))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const savePreparedQueryConfig = (projectId, dbAliasName, id, args, sql) => {
  return new Promise((resolve, reject) => {
    const preparedQueryConfig = getDbPreparedQuery(store.getState(), dbAliasName, id)
    const config = Object.assign({}, preparedQueryConfig, { sql, args })
    client.database.setPreparedQuery(projectId, dbAliasName, id, config)
      .then(() => {
        store.dispatch(set(`dbPreparedQueries.${dbAliasName}.${id}`, config))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const savePreparedQuerySecurityRule = (projectId, dbAliasName, id, rule) => {
  return new Promise((resolve, reject) => {
    const preparedQueryConfig = getDbPreparedQuery(store.getState(), dbAliasName, id)
    const config = Object.assign({}, preparedQueryConfig, { rule })
    client.database.setPreparedQuery(projectId, dbAliasName, id, config)
      .then(() => {
        store.dispatch(set(`dbPreparedQueries.${dbAliasName}.${id}.rule`, rule))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deletePreparedQuery = (projectId, dbAliasName, id) => {
  return new Promise((resolve, reject) => {
    client.database.deletePreparedQuery(projectId, dbAliasName, id)
      .then(() => {
        store.dispatch(del(`dbPreparedQueries.${dbAliasName}.${id}`))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const reloadDbSchema = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.reloadSchema(projectId, dbAliasName)
      .then(collections => {
        const dbSchemas = getDbSchemas(store.getState(), dbAliasName)
        Object.entries(collections).forEach(([colName, schema]) => {
          dbSchemas[colName] = schema
        })
        store.dispatch(set(`dbSchemas.${dbAliasName}`, dbSchemas))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const modifyDbSchema = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    const dbSchemas = getDbSchemas(store.getState(), dbAliasName)
    const dbSchemaRequest = Object.entries(dbSchemas).reduce((prev, curr) => {
      const [colName, schema] = curr
      return Object.assign({}, prev, { [colName]: { schema } })
    }, {})
    client.database.modifySchema(projectId, dbAliasName, dbSchemaRequest)
      .then(() => resolve())
      .catch(ex => reject(ex))
  })
}

const saveDbConfig = (projectId, dbAliasName, enabled, conn, type, dbName) => {
  return new Promise((resolve, reject) => {
    const dbConfig = { enabled, type, conn, name: dbName }
    client.database.setDbConfig(projectId, dbAliasName, dbConfig)
      .then(() => {
        store.dispatch(set(`dbConfigs.${dbAliasName}`, dbConfig))
        loadDBConnState(projectId, dbAliasName)
          .then(connected => resolve(connected))
          .catch(ex => reject(ex))
      })
      .catch(ex => reject(ex))
  })
}

export const addDatabase = (projectId, dbAliasName, dbType, dbName, conn) => {
  return new Promise((resolve, reject) => {
    const state = store.getState()
    const dbConfigs = getDbConfigs(state)
    const isFirstDatabase = Object.keys(dbConfigs).length === 0
    saveDbConfig(projectId, dbAliasName, true, conn, dbType, dbName)
      .then(() => {
        // Set default security rules for collections and prepared queries in the background
        saveColRule(projectId, dbAliasName, "default", defaultDBRules, false)
          .catch(ex => console.error("Error setting default collection rule" + ex.toString()))
        if (isPreparedQueriesSupported(state, dbAliasName)) {
          savePreparedQuerySecurityRule(projectId, dbAliasName, "default", defaultPreparedQueryRule)
            .catch(ex => console.error("Error setting default prepared query rule" + ex.toString()))
        }

        // If this is the first database, then auto configure it as the eventing database 
        if (isFirstDatabase) {
          saveEventingConfig(projectId, true, dbAliasName)
            .then(() => resolve(true))
            .catch(() => reject())
          return
        }
        resolve(false)
      })
      .catch(ex => reject(ex))
  })
}

export const enableDb = (projectId, dbAliasName, conn) => {
  return new Promise((resolve, reject) => {
    const { type, name } = getDbConfig(store.getState(), dbAliasName)
    saveDbConfig(projectId, dbAliasName, true, conn, type, name)
      .then(connected => resolve(connected))
      .catch(ex => reject(ex))
  })
}

export const disableDb = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    const { type, name, conn } = getDbConfig(store.getState(), dbAliasName)
    saveDbConfig(projectId, dbAliasName, false, conn, type, name)
      .then(() => resolve())
      .catch(ex => reject(ex))
  })
}

export const removeDbConfig = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.removeDbConfig(projectId, dbAliasName).then(() => {
      store.dispatch(del(`dbConfigs.${dbAliasName}`))
      store.dispatch(del(`dbSchemas.${dbAliasName}`))
      store.dispatch(del(`dbRules.${dbAliasName}`))
      store.dispatch(del(`dbPreparedQueries.${dbAliasName}`))

      // Disable eventing if the removed db is eventing db
      const eventingDB = getEventingDbAliasName(store.getState())
      if (dbAliasName === eventingDB) {
        saveEventingConfig(projectId, false, "")
          .then(() => resolve(true))
          .catch(ex => reject(ex))
        return
      }
      resolve(false)
    })
      .catch(ex => reject(ex))
  })
}

export const changeDbName = (projectId, dbAliasName, dbName) => {
  return new Promise((resolve, reject) => {
    const { conn, type } = getDbConfig(store.getState(), dbAliasName)
    saveDbConfig(projectId, dbAliasName, true, conn, type, dbName)
      .then(() => {
        modifyDbSchema(projectId, dbAliasName)
          .then(() => resolve())
          .catch(ex => reject(ex))
      })
      .catch(ex => reject(ex))
  })
}

// Getters
export const getDbConfigs = (state) => get(state, "dbConfigs", {})
export const getDbConfig = (state, dbAliasName) => get(state, `dbConfigs.${dbAliasName}`, {})
export const getDbName = (state, projectId, dbAliasName) => get(getDbConfig(state, dbAliasName), "name", projectId)
export const getDbType = (state, dbAliasName) => get(getDbConfig(state, dbAliasName), "type", dbAliasName)
export const getDbConnState = (state, dbAliasName) => get(state, `dbConnState.${dbAliasName}`, false)
export const getCollectionSchema = (state, dbAliasName, colName) => get(state, `dbSchemas.${dbAliasName}.${colName}`, "")
export const getDbSchemas = (state, dbAliasName) => get(state, `dbSchemas.${dbAliasName}`, {})
export const getDbRules = (state, dbAliasName) => get(state, `dbRules.${dbAliasName}`, {})
export const getDbPreparedQueries = (state, dbAliasName) => get(state, `dbPreparedQueries.${dbAliasName}`, {})
export const getDbPreparedQuery = (state, dbAliasName, preparedQueryId) => get(state, `dbPreparedQueries.${dbAliasName}.${preparedQueryId}`, { id: preparedQueryId, sql: "", args: [], rule: {} })
export const getDbDefaultPreparedQuerySecurityRule = (state, dbAliasName) => get(state, `dbPreparedQueries.${dbAliasName}.default.rule`, {})
export const getDbDefaultCollectionSecurityRule = (state, dbAliasName) => get(state, `dbRules.${dbAliasName}.default.rules`, {})
export const getCollections = (state, dbAliasName) => get(state, `dbCollections.${dbAliasName}`, [])
export const getTrackedCollectionsInfo = (state, dbAliasName) => {
  const schemas = getDbSchemas(state, dbAliasName)
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
  const schemas = getDbSchemas(state, dbAliasName)
  const rules = getDbRules(state, dbAliasName)
  const collections = [...new Set([...Object.keys(schemas), ...Object.keys(rules)])]
  return collections.filter(col => col !== "default" && col !== "invocation_logs" && col !== "event_logs")
}

export const getDbGraphQLRootFields = (state, dbAliasName) => {
  const schemas = getDbSchemas(state, dbAliasName)
  const rules = getDbRules(state, dbAliasName)
  const preparedQueries = getDbPreparedQueries(state, dbAliasName)
  return [...new Set([...Object.keys(schemas), ...Object.keys(rules), ...Object.keys(preparedQueries)])]
}

export const getUntrackedCollections = (state, dbAliasName) => {
  const schemas = getDbSchemas(state, dbAliasName)
  const rules = getDbRules(state, dbAliasName)
  const collections = getCollections(state, dbAliasName)
  return collections.filter(col => !schemas[col] && !rules[col] && col !== "default" && col !== "invocation_logs" && col !== "event_logs")
}

export const getDbConnectionString = (state, dbAliasName) => get(getDbConfig(state, dbAliasName), "conn", "")
export const getCollectionRules = (state, dbAliasName, colName) => get(state, `dbRules.${dbAliasName}.${colName}`, { isRealtimeEnabled: false, rules: {} })
export const isPreparedQueriesSupported = (state, dbAliasName) => {
  const dbType = getDbType(state, dbAliasName)
  return [dbTypes.POSTGRESQL, dbTypes.MYSQL, dbTypes.SQLSERVER].some(value => value === dbType)
}