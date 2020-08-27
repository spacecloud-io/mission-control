import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs } from "../../constants";
import { get, set } from "automate-redux";
import dotProp from "dot-prop-immutable";

export const loadDbSchemas = (projectId, dbAliasName = "*", colName = "*") => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_SCHEMA], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db schema")
      dispatch(set("dbSchemas", {}))
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
      let dbSchemas = Object.assign({}, get(getState, "dbSchemas", {}))
      Object.entries(result[0]).forEach(([key, value]) => {
        const [dbAliasName, colName] = key.split("-")
        dbSchemas = dotProp.set(dbSchemas, `${dbAliasName}.${colName}`, value.schema)
      })
      dispatch(set("dbSchemas", dbSchemas))
      resolve()
    })
    .catch(ex => reject(ex.toString()))
  })
}

export const inspectColSchema = (projectId, dbAliasName, colName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/collections/${colName}/schema/track`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const queued = status === 202;
      if (!queued) {
        loadDbSchemas(projectId, dbAliasName, colName)
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
        dispatch(set(`dbSchemas.${dbAliasName}.${colName}`, schema))
        const dbCollections = get(getState(), `dbCollections.${dbAliasName}`, [])
        if (!dbCollections.some(col => col === colName)) {
          const newDbCollections = [...dbCollections, colName]
          dispatch(set(`dbCollections.${dbAliasName}`, newDbCollections))
        }
      }
      resolve({ queued }) 
    })
    .catch(ex => reject(ex.toString()))
  })
}

export const reloadDbSchema = (projectId, dbAliasName) =>  (dispatch, getState) => {
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

export const modifyDbSchema = (projectId, dbAliasName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const dbSchemas = get(getState(), `dbSchemas.${dbAliasName}`, {})
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