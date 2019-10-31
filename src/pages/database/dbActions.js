import store from "../../store"
import {getProjectConfig, setProjectConfig} from "../../utils"
import { eventLogsSchema } from "../../constants"
import client from "../../client"
import { increment, decrement, set, get } from "automate-redux"

export const modifyColSchema = (projectId, dbName, colName, schema) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.modifyColSchema(projectId, dbName, colName, schema).then(() => {
      setProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections.${colName}.schema`, schema)
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const setColRule = (projectId, dbName, colName, rules, isRealtimeEnabled) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.setColRule(projectId, dbName, colName, { rules, isRealtimeEnabled }).then(() => {
      setProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections.${colName}.rules`, rules)
      setProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections.${colName}.isRealtimeEnabled`, isRealtimeEnabled)
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const setColConfig = (projectId, dbName, colName, rules, schema, isRealtimeEnabled) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    modifyColSchema(projectId, dbName, colName, schema).then(() => {
      setColRule(projectId, dbName, colName, rules, isRealtimeEnabled).then(() => resolve())
        .catch(ex => reject(ex))
    }).catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const deleteCol = (projectId, dbName, colName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.deleteCol(projectId, dbName, colName).then(() => {
      const newCollections = getProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections`, {})
      delete newCollections[colName]
      setProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections`, newCollections)
      const allCollectionsList = get(store.getState(), `extraConfig.${projectId}.crud.${dbName}.collections`, [])
        .filter(col => col !== colName)
      store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.collections`, allCollectionsList))
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const inspectColSchema = (projectId, dbName, colName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.inspectColSchema(projectId, dbName, colName).then(schema => {
      setProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections.${colName}.schema`, schema)
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const fetchCollections = (projectId, dbName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.listCollections(projectId, dbName).then((collections = []) => {
      const connected = get(store.getState(), `extraConfig.${projectId}.crud.${dbName}.connected`, false)
      store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.collections`, collections))
      if (connected && !collections.includes("event_logs")) {
        modifyColSchema(projectId, dbName, "event_logs", eventLogsSchema).then(() => resolve()).catch(ex => reject(ex))
        return
      }
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const fetchDBConnState = (projectId, dbName) => { 
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.getConnectionState(projectId, dbName).then(connected => {
      store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.connected`, connected))
      if (connected) {
        fetchCollections(projectId, dbName)
          .then(() => resolve()).
          catch(ex => reject(ex))
      }
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const handleModify = (projectId, dbName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    let collections = getProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections`, {})
    let cols = {}
    Object.entries(collections).forEach(([colName, colConfig]) => {
      cols[colName] = { schema: colConfig.schema }
    })
    client.database.modifySchema(projectId, dbName, cols).then(() => resolve())
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const handleReload = (projectId, dbName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.reloadSchema(projectId, dbName).then(collections => {
      const cols = getProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections`, {})
      Object.keys(collections).forEach(col => {
        cols[col].schema = collections[col].schema
      })
      setProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections`, cols)
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const setDBConfig = (projectId, dbName, enabled, conn) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.setDbConfig(projectId, dbName, { enabled, conn }).then(() => {
      setProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.enabled`, enabled)
      setProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.conn`, conn)
      store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.connected`, true))
      if (enabled) {
        fetchCollections().then(() => resolve()).catch(ex => reject(ex))
        return
      }
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}