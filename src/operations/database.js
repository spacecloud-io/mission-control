import { set, get, del } from "automate-redux";
import client from "../client";
import store from "../store";
import { setEventingConfig } from "./eventing"
import { defaultDBRules, defaultPreparedQueryRule } from "../constants";
import { canDatabaseHavePreparedQueries } from "../utils";

export const loadDbConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    client.database.fetchDbConfig(projectId)
      .then((result = []) => {
        const dbConfig = result.reduce((prev, curr) => {
          const [dbAliasName, config] = Object.entries(curr)[0]
          return Object.assign({}, prev, { [dbAliasName]: config })
        }, {})
        store.dispatch(set("dbConfig", dbConfig))
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

export const loadCollections = (projectId, dbAliasName) => {
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
            .then(() => resolve())
            .catch(ex => reject(ex))
          return
        }
        resolve()
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

export const setColSchema = (projectId, dbAliasName, colName, schema) => {
  return new Promise((resolve, reject) => {
    client.database.modifyColSchema(projectId, dbAliasName, colName, schema)
      .then(() => {
        store.dispatch(set(`dbSchemas.${dbAliasName}.${colName}`, schema))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setColRule = (projectId, dbAliasName, colName, securityRules, isRealtimeEnabled) => {
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

export const setColRealtimeEnabled = (projectId, dbAliasName, colName, isRealtimeEnabled) => {
  return new Promise((resolve, reject) => {
    const collectionSecurityRules = get(store.getState(), `dbRules.${dbAliasName}.${colName}.rules`, {})
    const collectionRules = { rules: collectionSecurityRules, isRealtimeEnabled }
    client.database.setColRule(projectId, dbAliasName, colName, collectionRules)
      .then(() => {
        store.dispatch(set(`dbRules.${dbAliasName}.${colName}.isRealtimeEnabled`, isRealtimeEnabled))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setColSecurityRules = (projectId, dbAliasName, colName, securityRules) => {
  return new Promise((resolve, reject) => {
    const isRealtimeEnabled = get(store.getState(), `dbRules.${dbAliasName}.${colName}.isRealtimeEnabled`, false)
    const collectionRules = { rules: securityRules, isRealtimeEnabled }
    client.database.setColRule(projectId, dbAliasName, colName, collectionRules)
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

export const setPreparedQueryConfig = (projectId, dbAliasName, id, args, sql) => {
  return new Promise((resolve, reject) => {
    const preparedQueryConfig = get(store.getState(), `dbPreparedQueries.${dbAliasName}.${id}`, {})
    const config = Object.assign({}, preparedQueryConfig, { id, sql, args })
    client.database.setPreparedQuery(projectId, dbAliasName, id, config)
      .then(() => {
        store.dispatch(set(`dbPreparedQueries.${dbAliasName}.${id}`, config))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setPreparedQuerySecurityRule = (projectId, dbAliasName, id, rule) => {
  return new Promise((resolve, reject) => {
    const preparedQueryConfig = get(store.getState(), `dbPreparedQueries.${dbAliasName}.${id}`, {})
    const config = Object.assign({}, preparedQueryConfig, { id, rule })
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
        const dbSchema = get(store.getState(), `dbSchemas.${dbAliasName}`, {})
        Object.entries(collections).forEach(([colName, schema]) => {
          dbSchema[colName] = schema
        })
        store.dispatch(set(`dbSchemas.${dbAliasName}`, dbSchema))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const modifyDbSchema = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    const dbSchema = get(store.getState(), `dbSchemas.${dbAliasName}`, {})
    const dbSchemaRequest = Object.entries(dbSchema).reduce((prev, curr) => {
      const [colName, schema] = curr
      return Object.assign({}, prev, { [colName]: { schema } })
    }, {})
    client.database.modifySchema(projectId, dbAliasName, dbSchemaRequest)
      .then(() => resolve())
      .catch(ex => reject(ex))
  })
}

const setDBConfig = (projectId, dbAliasName, enabled, conn, type, dbName) => {
  return new Promise((resolve, reject) => {
    const dbConfig = { enabled, type, conn, name: dbName }
    client.database.setDbConfig(projectId, dbAliasName, dbConfig)
      .then(() => {
        store.dispatch(set(`dbConfig.${dbAliasName}`, dbConfig))
        store.dispatch(set(`dbConnState.${dbAliasName}`, true))
        if (enabled) {
          loadCollections(projectId, dbAliasName)
            .then(() => resolve())
            .catch(ex => reject(ex))
          return
        }
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const addDatabase = (projectId, dbAliasName, dbType, dbName, conn) => {
  return new Promise((resolve, reject) => {
    const dbConfig = get(store.getState(), "dbConfig", {})
    const isFirstDatabase = Object.keys(dbConfig).length === 0
    setDBConfig(projectId, dbAliasName, true, conn, dbType, dbName)
      .then(() => {
        // Set default security rules for collections and prepared queries in the background
        setColRule(projectId, dbAliasName, "default", defaultDBRules, false)
          .catch(ex => console.error("Error setting default collection rule" + ex.toString()))
        if (canDatabaseHavePreparedQueries(dbAliasName)) {
          setPreparedQuerySecurityRule(projectId, dbAliasName, "default", defaultPreparedQueryRule)
            .catch(ex => console.error("Error setting default prepared query rule" + ex.toString()))
        }

        // If this is the first database, then auto configure it as the eventing database 
        if (isFirstDatabase) {
          setEventingConfig(projectId, true, dbAliasName).then(() => resolve(true)).reject(() => reject())
          return
        }
        resolve(false)
      })
      .catch(ex => reject(ex))
  })
}

export const enableDb = (projectId, dbAliasName, conn) => {
  return new Promise((resolve, reject) => {
    const { type, name } = get(store.getState(), "dbConfig", {})
    setDBConfig(projectId, dbAliasName, true, conn, type, name)
      .then(() => resolve())
      .catch(ex => reject(ex))
  })
}

export const disableDb = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    const { type, name, conn } = get(store.getState(), "dbConfig", {})
    setDBConfig(projectId, dbAliasName, false, conn, type, name)
      .then(() => resolve())
      .catch(ex => reject(ex))
  })
}

export const removeDbConfig = (projectId, dbAliasName) => {
  return new Promise((resolve, reject) => {
    client.database.removeDbConfig(projectId, dbAliasName).then(() => {
      store.dispatch(del(`dbConfig.${dbAliasName}`))
      store.dispatch(del(`dbSchemas.${dbAliasName}`))
      store.dispatch(del(`dbRules.${dbAliasName}`))
      store.dispatch(del(`dbPreparedQueries.${dbAliasName}`))

      // Disable eventing if the removed db is eventing db
      const eventingDB = get(store.getState(), "eventingConfig.dbAlias", "")
      if (dbAliasName === eventingDB) {
        setEventingConfig(projectId, false, "")
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
    const { conn, type } = get(store.getState(), "dbConfig", {})
    setDBConfig(projectId, dbAliasName, true, conn, type, dbName)
      .then(() => {
        modifyDbSchema(projectId, dbAliasName)
          .then(() => resolve())
          .catch(ex => reject(ex))
      })
      .catch(ex => reject(ex))
  })
}