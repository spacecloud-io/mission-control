import store from "../store"
import { getProjectConfig, setProjectConfig } from "../utils"
import { defaultDBRules, eventingSchema, defaultEventRule } from "../constants"
import client from "../client"
import history from '../history';
import { increment, decrement, set, get } from "automate-redux"

export const modifyColSchema = (projectId, dbName, colName, schema) => {
    return new Promise((resolve, reject) => {
        client.database.modifyColSchema(projectId, dbName, colName, schema).then(() => {
            setProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}.schema`, schema)
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const setColRule = (projectId, dbName, colName, rules, isRealtimeEnabled) => {
    return new Promise((resolve, reject) => {
        client.database.setColRule(projectId, dbName, colName, { rules, isRealtimeEnabled }).then(() => {
            setProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}.rules`, rules)
            setProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}.isRealtimeEnabled`, isRealtimeEnabled)
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const setColConfig = (projectId, dbName, colName, rules, schema, isRealtimeEnabled) => {
    return new Promise((resolve, reject) => {
        modifyColSchema(projectId, dbName, colName, schema).then(() => {
            setColRule(projectId, dbName, colName, rules, isRealtimeEnabled).then(() => resolve())
                .catch(ex => reject(ex))
        }).catch(ex => reject(ex))
    })
}

export const deleteCol = (projectId, dbName, colName) => {
    return new Promise((resolve, reject) => {
        client.database.deleteCol(projectId, dbName, colName).then(() => {
            const newCollections = getProjectConfig(projectId, `modules.crud.${dbName}.collections`, {})
            delete newCollections[colName]
            setProjectConfig(projectId, `modules.crud.${dbName}.collections`, newCollections)
            const allCollectionsList = get(store.getState(), `extraConfig.${projectId}.crud.${dbName}.collections`, [])
                .filter(col => col !== colName)
            store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.collections`, allCollectionsList))
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const inspectColSchema = (projectId, dbName, colName) => {
    return new Promise((resolve, reject) => {
        client.database.inspectColSchema(projectId, dbName, colName).then(schema => {
            const colConfig = getProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}`, { isRealtimeEnabled: false, rules: defaultDBRules })
            colConfig.schema = schema
            setProjectConfig(projectId, `modules.crud.${dbName}.collections.${colName}`, colConfig)
            setColRule(projectId, dbName, colName, {}).then(() => resolve()).catch(ex => reject(ex))
        })
            .catch(ex => reject(ex))
    })
}

export const fetchCollections = (projectId, dbName) => {
    return new Promise((resolve, reject) => {
        client.database.listCollections(projectId, dbName).then((collections = []) => {
            const connected = get(store.getState(), `extraConfig.${projectId}.crud.${dbName}.connected`, false)
            store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.collections`, collections))
            if (connected && !collections.includes("event_logs")) {
                modifyColSchema(projectId, dbName, "event_logs", eventingSchema).then(() => resolve()).catch(ex => reject(ex))
                return
            }
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const fetchDBConnState = (projectId, dbName) => {
    return new Promise((resolve, reject) => {
        client.database.getConnectionState(projectId, dbName).then(connected => {
            store.dispatch(set(`extraConfig.${projectId}.crud.${dbName}.connected`, connected))
            if (connected) {
                fetchCollections(projectId, dbName)
                    .then(() => resolve()).
                    catch(ex => reject(ex))
            }
        })
            .catch(ex => reject(ex))
    })
}

export const handleModify = (projectId, dbName) => {
    return new Promise((resolve, reject) => {
        let collections = getProjectConfig(projectId, `modules.crud.${dbName}.collections`, {})
        let cols = {}
        Object.entries(collections).forEach(([colName, colConfig]) => {
            cols[colName] = { schema: colConfig.schema }
        })
        client.database.modifySchema(projectId, dbName, cols).then(() => resolve())
            .catch(ex => reject(ex))
    })
}

export const handleReload = (projectId, dbName) => {
    return new Promise((resolve, reject) => {
        client.database.reloadSchema(projectId, dbName).then(collections => {
            const cols = getProjectConfig(projectId, `modules.crud.${dbName}.collections`, {})
            Object.keys(collections).forEach(col => {
                cols[col].schema = collections[col]
            })
            setProjectConfig(projectId, `modules.crud.${dbName}.collections`, cols)
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const setDBConfig = (projectId, aliasName, enabled, conn, type) => {
    return new Promise((resolve, reject) => {
        client.database.setDbConfig(projectId, aliasName, { enabled, conn, type }).then(() => {
            setProjectConfig(projectId, `modules.crud.${aliasName}.enabled`, enabled)
            setProjectConfig(projectId, `modules.crud.${aliasName}.conn`, conn)
            setProjectConfig(projectId, `modules.crud.${aliasName}.type`, type)
            store.dispatch(set(`extraConfig.${projectId}.crud.${aliasName}.connected`, true))
            if (enabled) {
                fetchCollections(projectId, aliasName).then(() => resolve()).catch(ex => reject(ex))
                return
            }
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const removeDBConfig = (projectId, aliasName) => {
    return new Promise((resolve, reject) => {
        client.database.removeDbConfig(projectId, aliasName).then(() => {
            const dbconfig = getProjectConfig(projectId, `modules.crud`)
            const dbList = delete dbconfig[aliasName]
            store.dispatch(set(`extraConfig.${projectId}.crud`, dbList))
            history.push(`/mission-control/projects/${projectId}/database`)
            resolve()
        })
            .catch(ex => {
                reject(ex)
            })
    })
}

const setDefaultEventSecurityRule = (projectId, type, rule) => {
    return new Promise((resolve, reject) => {
        client.eventTriggers.setSecurityRule(projectId, type, rule).then(() => {
            setProjectConfig(projectId, "modules.eventing.securityRules.default", rule)
            resolve()
        }).catch((ex) => reject(ex))
    })
}

const handleEventingConfig = (projects, projectId, alias) => {
    client.eventTriggers.setEventingConfig(projectId, { enabled: true, dbType: alias, col: "event_logs" })
        .then(() => {
            setProjectConfig(projectId, "modules.eventing", { enabled: true, dbType: alias, col: 'event_logs' })
            setDefaultEventSecurityRule(projectId, "default", defaultEventRule)
        })
}

export const dbEnable = (projects, projectId, aliasName, conn, rules, type, cb) => {
    return new Promise((resolve, reject) => {
        setDBConfig(projectId, aliasName, true, conn, type, false).then(() => {
            if (cb) cb()
            const dbconfig = getProjectConfig(projectId, `modules.crud`)
            if (Object.keys(dbconfig).length === 0) {
                handleEventingConfig(projects, projectId, aliasName)
            }
            setColRule(projectId, aliasName, "default", rules, type, true)
               .catch(ex => reject(ex))
            resolve()
        }).catch(ex => {
            if (cb) cb(ex)
            reject(ex)
        })
    })
}
