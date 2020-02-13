import store from "../../store"
import { getProjectConfig, setProjectConfig } from "../../utils"
import { defaultDBRules, eventingSchema, defaultEventRule } from "../../constants"
import client from "../../client"
import { increment, decrement, set, get } from "automate-redux"
import { notify } from '../../utils';
import history from '../../history';

export const modifyColSchema = (projectId, dbName, colName, schema, setLoading) => {
  return new Promise((resolve, reject) => {
    if (setLoading) store.dispatch(increment("pendingRequests"))
    client.database.modifyColSchema(projectId, dbName, colName, schema).then(() => {
      setProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}.schema`, schema)
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => { if (setLoading) store.dispatch(decrement("pendingRequests")) })
  })
}

export const setColRule = (projectId, dbName, colName, rules, isRealtimeEnabled, setLoading) => {
  return new Promise((resolve, reject) => {
    if (setLoading) store.dispatch(increment("pendingRequests"))

    client.database.setColRule(projectId, dbName, colName, { rules, isRealtimeEnabled }).then(() => {
      setProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}.rules`, rules)
      setProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}.isRealtimeEnabled`, isRealtimeEnabled)
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => { if (setLoading) store.dispatch(decrement("pendingRequests")) })
  })
}

export const setColConfig = (projectId, dbName, colName, rules, schema, isRealtimeEnabled) => {
  return new Promise((resolve, reject) => {
    modifyColSchema(projectId, dbName, colName, schema, false).then(() => {
      setColRule(projectId, dbName, colName, rules, isRealtimeEnabled, false).then(() => resolve())
        .catch(ex => reject(ex))
    }).catch(ex => reject(ex))
  })
}

export const deleteCol = (projectId, dbName, colName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.deleteCol(projectId, dbName, colName).then(() => {
      const newCollections = getProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections`, {})
      delete newCollections[colName]
      setProjectConfig(projectId, `modules.crud.${dbName}.collections`, newCollections)
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
      const colConfig = getProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections.${colName}`, { isRealtimeEnabled: false, rules: defaultDBRules })
      colConfig.schema = schema
      setProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}`, colConfig)
      setColRule(projectId, dbName, colName, {}, false).then(() => resolve()).catch(ex => reject(ex))
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const fetchCollections = (projectId, dbName, setLoading) => {
  return new Promise((resolve, reject) => {
    if (setLoading) store.dispatch(increment("pendingRequests"))
    client.database.listCollections(projectId, dbName).then((collections = []) => {
      const connected = get(store.getState(), `extraConfig.${projectId}.crud.${dbName}.connected`, false)
      store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.collections`, collections))
      if (connected && !collections.includes("event_logs")) {
        modifyColSchema(projectId, dbName, "event_logs", eventingSchema, setLoading).then(() => resolve()).catch(ex => reject(ex))
        return
      }
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => { if (setLoading) store.dispatch(decrement("pendingRequests")) })
  })
}

export const fetchDBConnState = (projectId, dbName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.getConnectionState(projectId, dbName).then(connected => {
      store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.connected`, connected))
      if (connected) {
        fetchCollections(projectId, dbName, true)
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
        cols[col].schema = collections[col]
      })
      setProjectConfig(projectId, `modules.crud.${dbName}.collections`, cols)
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const setDBConfig = (projectId, aliasName, enabled, conn, type, setLoading) => {
  if (setLoading) store.dispatch(increment("pendingRequests"))
  return new Promise((resolve, reject) => {
    client.database.setDbConfig(projectId, aliasName, { enabled, conn, type }).then(() => {
      setProjectConfig(projectId, `modules.crud.${aliasName}.enabled`, enabled)
      setProjectConfig(projectId, `modules.crud.${aliasName}.conn`, conn)
      setProjectConfig(projectId, `modules.crud.${aliasName}.type`, type)
      store.dispatch(set(`extraConfig.${projectId}.crud.${aliasName}.connected`, true))
      if (enabled) {
        fetchCollections(projectId, aliasName, false).then(() => resolve()).catch(ex => reject(ex))
        return
      }
      resolve()
    })
      .catch(ex => reject(ex))
  })
    .finally(() => { if (setLoading) store.dispatch(decrement("pendingRequests")) })
}

export const removeDBConfig = (projectId, aliasName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.removeDbConfig(projectId, aliasName).then(() => {
      notify("success", "Success", "Removed database config successfully")
      const dbconfig = getProjectConfig(store.getState().projects, projectId, `modules.crud`)
      const dbList = delete dbconfig[aliasName]
      store.dispatch(set(`extraConfig.${projectId}.crud`, dbList))
      history.push(`/mission-control/projects/${projectId}/database`)
      resolve()
    })
      .catch(ex => {
        reject(ex)
        notify("error", "Error removing database config", ex)
      })
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

const setDefaultEventSecurityRule = (projectId, type, rule) => {
  return new Promise((resolve, reject) => {
    client.eventing.setSecurityRule(projectId, type, rule).then(() => {
      setProjectConfig(projectId, "modules.eventing.securityRules.default", rule)
      resolve()
    }).catch((ex) => reject(ex))
  })
}

const handleEventingConfig = (projects, projectId, alias) => {
  store.dispatch(increment("pendingRequests"))
  client.eventing.setEventingConfig(projectId, { enabled: true, dbType: alias, col: "event_logs" })
    .then(() => {
      setProjectConfig(projectId, "modules.eventing", { enabled: true, dbType: alias, col: 'event_logs' })
      setDefaultEventSecurityRule(projectId, "default", defaultEventRule)
      notify("success", "Success", "Changed eventing config successfully")
    })
    .catch(ex => notify("error", "Error", ex))
    .finally(() => store.dispatch(decrement("pendingRequests")))
}

export const dbEnable = (projects, projectId, aliasName, conn, rules, type, cb) => {
  store.dispatch(increment("pendingRequests"))
  setDBConfig(projectId, aliasName, true, conn, type, false).then(() => {
    notify("success", "Success", "Enabled database successfully")
    if (cb) cb()
    const dbconfig = getProjectConfig(projects, projectId, `modules.crud`)
    if (Object.keys(dbconfig).length === 0) {
      handleEventingConfig(projects, projectId, aliasName)
    }
    setColRule(projectId, aliasName, "default", rules, type, true)
      .catch(ex => notify("error", "Error configuring default rules", ex))
  }).catch(ex => {
    notify("error", "Error enabling database", ex)
    if (cb) cb(ex)
  })
    .finally(() => store.dispatch(decrement("pendingRequests")))
}