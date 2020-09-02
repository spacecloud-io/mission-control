import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs } from "../../constants";
import { set, get, del } from "automate-redux";
import dotProp from "dot-prop-immutable";
import { getDbPreparedQueries } from "./preparedQuery";

export const loadDbSchemas = (projectId, dbAliasName = "*", colName = "*") => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_SCHEMA], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db schema")
      dispatch(setDbSchemas({}))
      resolve()
      return
    }

    scClient.getJSON(`/v1/config/projects/${projectId}/database/collections/schema/mutate?dbAlias=${dbAliasName}&col=${colName}`)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const result = data.result ? data.result : []
        let dbSchemas = Object.assign({}, getDbSchemas(getState()))
        Object.entries(result[0]).forEach(([key, value]) => {
          const [dbAliasName, colName] = key.split("-")
          dbSchemas = dotProp.set(dbSchemas, `${dbAliasName}.${colName}`, value.schema)
        })
        dispatch(setDbSchemas(dbSchemas))
        resolve()
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const inspectColSchema = (projectId, dbAliasName, colName) => (dispatch) => {
  return new Promise((resolve, reject) => {
    scClient.getJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/collections/${colName}/schema/track`)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202;
        if (!queued) {
          dispatch(loadDbSchemas(projectId, dbAliasName, colName))
            .then(() => resolve({ queued }))
            .catch(ex => reject(ex))
          return
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const saveColSchema = (projectId, dbAliasName, colName, schema) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/collections/${colName}/schema/mutate`, { schema })
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202
        if (!queued) {
          dispatch(setDbSchema(dbAliasName, colName, schema))
          const dbCollections = getCollections(getState(), dbAliasName)
          if (!dbCollections.some(col => col === colName)) {
            const newDbCollections = [...dbCollections, colName]
            dispatch(setDbCollections(dbAliasName, newDbCollections))
          }
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const reloadDbSchema = (projectId, dbAliasName) => (dispatch) => {
  return new Promise((resolve, reject) => {
    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/schema/inspect`, {})
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202
        if (!queued) {
          dispatch(loadDbSchemas(projectId, dbAliasName))
            .then(() => resolve({ queued }))
            .catch(ex => reject(ex))
          return
        }

        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const modifyDbSchema = (projectId, dbAliasName) => (_, getState) => {
  return new Promise((resolve, reject) => {

    const dbSchemas = getDbSchema(getState(), dbAliasName)
    const collections = Object.entries(dbSchemas).reduce((prev, curr) => {
      const [colName, schema] = curr
      return Object.assign({}, prev, { [colName]: { schema } })
    }, {})

    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/schema/mutate`, { collections })
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const loadDbRules = (projectId) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const hasPermission = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_RULES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db rules")
      dispatch(setDbRules({}))
      resolve()
      return
    }
    
    scClient.getJSON(`/v1/config/projects/${projectId}/database/collections/rules`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const result = data.result ? data.result : []
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
      dispatch(setDbRules(dbRules))
      resolve()
    })
    .catch(ex => reject(ex.toString()))
  })
}

export const saveColRule = (projectId, dbAliasName, colName, collectionRules) => (dispatch) => {
  return new Promise((resolve, reject) => {

    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/collections/${colName}/rules`, {
      isRealtimeEnabled: typeof collectionRules.isRealtimeEnabled === "string" ? false : collectionRules.isRealtimeEnabled, ...collectionRules
    })
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202;
        if (!queued) {
          dispatch(setColRules(dbAliasName, colName, collectionRules))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const saveColSecurityRules = (projectId, dbAliasName, colName, securityRules) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const collectionRules = getCollectionRules(getState(), dbAliasName, colName)
    const newCollectionRules = Object.assign({}, collectionRules, { rules: securityRules })

    dispatch(saveColRule(projectId, dbAliasName, colName, newCollectionRules))
      .then(({ queued }) => resolve({ queued }))
      .catch(ex => reject(ex))
  })
}

export const loadCollections = (projectId, dbAliasName) => (dispatch) => {
  return new Promise((resolve, reject) => {

    scClient.getJSON(`/v1/external/projects/${projectId}/database/${dbAliasName}/list-collections`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const result = data.result ? data.result : []
      dispatch(setDbCollections(dbAliasName, result))
      resolve()
    })
    .catch(ex => reject(ex.toString()))
  })
}

export const saveColRealtimeEnabled = (projectId, dbAliasName, colName, isRealtimeEnabled) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const collectionRules = getCollectionRules(getState(), dbAliasName, colName)
    const newCollectionRules = Object.assign({}, collectionRules, { isRealtimeEnabled })

    dispatch(saveColRule(projectId, dbAliasName, colName, newCollectionRules))
      .then(({ queued }) => resolve({ queued }))
      .catch(ex => reject(ex))
  })
}

export const untrackCollection = (projectId, dbAliasName, colName) => (dispatch) => {
  return new Promise((resolve, reject) => {

    scClient.delete(`/v1/config/projects/${projectId}/database/${dbAliasName}/collections/${colName}/schema/untrack`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const queued = status === 202;
      if (!queued) {
        dispatch(del(`dbSchemas.${dbAliasName}.${colName}`))
        dispatch(del(`dbRules.${dbAliasName}.${colName}`))
      }
      resolve({ queued })
    })
    .catch(ex => reject(ex.toString()))
  })
}

export const deleteCollection = (projectId, dbAliasName, colName) => (dispatch, getState) => {

  return new Promise((resolve, reject) => {
    scClient.delete(`/v1/config/projects/${projectId}/database/${dbAliasName}/collections/${colName}`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const queued = status === 202
      if (!queued) {
        const collectionsList = get(getState(), `dbCollections.${dbAliasName}`, [])
        const newCollectionsList = collectionsList.filter(col => col !== colName)

        dispatch(delColSchemas(dbAliasName, colName))
        dispatch(delColRules(dbAliasName, colName))
        dispatch(setDbCollections(dbAliasName, newCollectionsList))
      }
      resolve({ queued })
    })
    .catch(ex => reject(ex.toString()))
  })
}

// Getters
export const getCollectionSchema = (state, dbAliasName, colName) => get(state, `dbSchemas.${dbAliasName}.${colName}`, "")
export const getDbSchema = (state, dbAliasName) => get(state, `dbSchemas.${dbAliasName}`, {})
export const getDbSchemas = (state) => get(state, "dbSchemas", {})
export const getCollections = (state, dbAliasName) => get(state, `dbCollections.${dbAliasName}`, [])
export const getDbRules = (state, dbAliasName) => get(state, `dbRules.${dbAliasName}`, {})
export const getCollectionRules = (state, dbAliasName, colName) => get(state, `dbRules.${dbAliasName}.${colName}`, { isRealtimeEnabled: false, rules: {} })
export const getCollectionSecurityRule = (state, dbAliasName, colName) => get(state, `dbRules.${dbAliasName}.${colName}.rules`, {})


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
  return collections.filter(col => !schemas[col] && !rules[col] && col !== "default" && col !== "invocation_logs" && col !== "event_logs")
}

// Setters
export const setColSecurityRule = (dbAliasName, colName, rule) => set(`dbRules.${dbAliasName}.${colName}.rules`, rule)
const setDbCollections = (dbAliasName, collections) => set(`dbCollections.${dbAliasName}`, collections)
const setDbSchemas = (dbSchemas) => set("dbSchemas", dbSchemas)
const setDbSchema = (dbAliasName, colName, schema) => set(`dbSchemas.${dbAliasName}.${colName}`, schema)
const setDbRules = (dbRules) => set("dbRules", dbRules)
const setColRules = (dbAliasName, colName, colRules) => set(`dbRules.${dbAliasName}.${colName}`, colRules)
const delColSchemas = (dbAliasName, colName) => del(`dbSchemas.${dbAliasName}.${colName}`)
const delColRules = (dbAliasName, colName) => del(`dbRules.${dbAliasName}.${colName}`)

