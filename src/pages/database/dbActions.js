import store from "../../store"
import { getProjectConfig, setProjectConfig, getEventingDB, canDatabaseHavePreparedQueries, getDBTypeFromAlias, getDefaultPreparedQueriesRule } from "../../utils"
import { defaultDBRules, defaultEventRule } from "../../constants"
import client from "../../client"
import { increment, decrement, set, get } from "automate-redux"
import { notify } from '../../utils';

export const modifyColSchema = (projectId, dbName, colName, schema, setLoading) => {
  return new Promise((resolve, reject) => {
    if (setLoading) store.dispatch(increment("pendingRequests"))
    client.database.modifyColSchema(projectId, dbName, colName, schema).then(() => {
      setProjectConfig(projectId, `modules.db.${dbName}.collections.${colName}.schema`, schema)
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
      setProjectConfig(projectId, `modules.db.${dbName}.collections.${colName}.rules`, rules)
      setProjectConfig(projectId, `modules.db.${dbName}.collections.${colName}.isRealtimeEnabled`, isRealtimeEnabled)
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
      const newCollections = getProjectConfig(store.getState().projects, projectId, `modules.db.${dbName}.collections`, {})
      delete newCollections[colName]
      setProjectConfig(projectId, `modules.db.${dbName}.collections`, newCollections)
      const allCollectionsList = get(store.getState(), `extraConfig.${projectId}.db.${dbName}.collections`, [])
        .filter(col => col !== colName)
      store.dispatch(set(`extraConfig.${projectId}.db.${dbName}.collections`, allCollectionsList))
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
      const colConfig = getProjectConfig(store.getState().projects, projectId, `modules.db.${dbName}.collections.${colName}`, { isRealtimeEnabled: false, rules: defaultDBRules })
      colConfig.schema = schema
      setProjectConfig(projectId, `modules.db.${dbName}.collections.${colName}`, colConfig)
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
      const connected = get(store.getState(), `extraConfig.${projectId}.db.${dbName}.connected`, false)
      store.dispatch(set(`extraConfig.${projectId}.db.${dbName}.collections`, collections))
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
      store.dispatch(set(`extraConfig.${projectId}.db.${dbName}.connected`, connected))
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

export const handleModify = (projectId, aliasName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    let collections = getProjectConfig(store.getState().projects, projectId, `modules.db.${aliasName}.collections`, {})
    let cols = {}
    Object.entries(collections).forEach(([colName, colConfig]) => {
      cols[colName] = { schema: colConfig.schema }
    })
    client.database.modifySchema(projectId, aliasName, cols).then(() => resolve())
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const handleReload = (projectId, dbName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"))
    client.database.reloadSchema(projectId, dbName).then(collections => {
      const cols = getProjectConfig(store.getState().projects, projectId, `modules.db.${dbName}.collections`, {})
      Object.keys(collections).forEach(col => {
        cols[col].schema = collections[col]
      })
      setProjectConfig(projectId, `modules.db.${dbName}.collections`, cols)
      resolve()
    })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  })
}

export const setDBConfig = (projectId, aliasName, enabled, conn, type, dbName, setLoading) => {
  if (setLoading) store.dispatch(increment("pendingRequests"))
  return new Promise((resolve, reject) => {
    client.database.setDbConfig(projectId, aliasName, { enabled, conn, type, dbName }).then(() => {
      setProjectConfig(projectId, `modules.db.${aliasName}.enabled`, enabled)
      setProjectConfig(projectId, `modules.db.${aliasName}.conn`, conn)
      setProjectConfig(projectId, `modules.db.${aliasName}.type`, type)
      setProjectConfig(projectId, `modules.db.${aliasName}.dbName`, dbName)
      store.dispatch(set(`extraConfig.${projectId}.db.${aliasName}.connected`, true))
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
    client.database.removeDbConfig(projectId, aliasName).then(() => {
      const dbconfig = getProjectConfig(store.getState().projects, projectId, `modules.db`)
      const dbList = delete dbconfig[aliasName]
      store.dispatch(set(`extraConfig.${projectId}.db`, dbList))
      resolve()
      const eventingDB = getEventingDB(projectId)
      if (aliasName === eventingDB) {
        client.eventing.setEventingConfig(projectId, { enabled: false, dbAlias: "" }).then(() => {
          setProjectConfig(projectId, "modules.eventing.enabled", false)
          setProjectConfig(projectId, "modules.eventing.dbAlias", "")
          notify("warn", "Warning", "Eventing is auto disabled. Enable it by changing eventing db or adding a new db")
        })
      }
    })
      .catch(ex => reject(ex))
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
  client.eventing.setEventingConfig(projectId, { enabled: true, dbAlias: alias })
    .then(() => {
      setProjectConfig(projectId, "modules.eventing.enabled", true)
      setProjectConfig(projectId, "modules.eventing.dbAlias", alias)

      const defaultEventingSecurityRule = getProjectConfig(projects, projectId, "modules.eventing.securityRules.default")
      if (!defaultEventingSecurityRule) {
        setDefaultEventSecurityRule(projectId, "default", defaultEventRule)
      }
      notify("success", "Success", "Changed eventing config successfully")
    })
    .catch(ex => notify("error", "Error", ex))
    .finally(() => store.dispatch(decrement("pendingRequests")))
}

export const setPreparedQueries = (projectId, aliasName, id, args, sql, rule) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"));
    const config = { id, sql, rule, args }
    client.database.setPreparedQueries(projectId, aliasName, id, config)
      .then(() => {
        const preparedQueries = getProjectConfig(store.getState().projects, projectId, `modules.db.${aliasName}.preparedQueries`, {})
        preparedQueries[id] = config
        setProjectConfig(projectId, `modules.db.${aliasName}.preparedQueries`, preparedQueries);
        resolve()
      })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")));
  })
}

export const setUntrackCollection = (projectId, aliasName, colName) => {
  return new Promise((resolve, reject) => {
    store.dispatch(increment("pendingRequests"));
    client.database.setUntrackCollection(projectId, aliasName, colName)
      .then(() => {
        const collections = getProjectConfig(store.getState().projects, projectId, `modules.db.${aliasName}.collections`, [])
        delete collections[colName]
        setProjectConfig(projectId, `modules.db.${aliasName}.collections`, collections);
        resolve()
      })
      .catch(ex => reject(ex))
      .finally(() => store.dispatch(decrement("pendingRequests")));
  })
}

export const dbEnable = (projects, projectId, aliasName, dbType, dbName, conn, defaultCollectionRule, defaultPreparedQueryRule) => {
  if (!defaultPreparedQueryRule) defaultPreparedQueryRule = getDefaultPreparedQueriesRule(projectId, aliasName)
  return new Promise((resolve, reject) => {
    setDBConfig(projectId, aliasName, true, conn, dbType, dbName, false).then(() => {
      resolve()
      const dbconfig = getProjectConfig(projects, projectId, `modules.db`)
      if (Object.keys(dbconfig).length === 0) {
        handleEventingConfig(projects, projectId, aliasName)
      }
      setColRule(projectId, aliasName, "default", defaultCollectionRule, false, false)
        .catch(ex => notify("error", "Error configuring default rules for collections/tables", ex))
      if (canDatabaseHavePreparedQueries(projectId, aliasName)) {
        setPreparedQueries(projectId, aliasName, "default", [], "", defaultPreparedQueryRule)
          .catch(ex => notify("error", "Error configuring default rules for prepared queries", ex))
      }
    })
      .catch(ex => reject(ex))
  })
}

export const changeDatabaseName = (projectId, aliasName, dbName) => {
  return new Promise((resolve, reject) => {
    const projects = store.getState().projects
    const dbType = getDBTypeFromAlias(projectId, aliasName)
    const conn = getProjectConfig(projects, projectId, `modules.db.${aliasName}.conn`, "")
    const defaultCollectionRule = getProjectConfig(projects, projectId, `modules.db.${aliasName}.collections.default.rules`)

    dbEnable(projects, projectId, aliasName, dbType, dbName, conn, defaultCollectionRule)
      .then(() => {
        handleModify(projectId, aliasName)
          .then(() => resolve())
          .catch(ex => reject(ex))
      })
      .catch(ex => reject(ex))
  })
}

export const changeDatabaseAliasName = (projectId, aliasName, newAliasName) => {
  return new Promise((resolve, reject) => {
    const projects = store.getState().projects
    const { type, conn, dbName } = getProjectConfig(projects, projectId, `modules.db.${aliasName}`)
    const defaultCollectionRule = getProjectConfig(projects, projectId, `modules.db.${aliasName}.collections.default.rules`, {})
    const defaultPreparedQueryRule = getDefaultPreparedQueriesRule(projectId, aliasName)
    removeDBConfig(projectId, aliasName)
      .then(() => {
        dbEnable(projects, projectId, newAliasName, type, dbName, conn, defaultCollectionRule, defaultPreparedQueryRule)
          .then(() => resolve())
          .catch(ex => reject(ex))
      })
      .catch(ex => reject(ex))
  })
}