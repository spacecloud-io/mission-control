import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs, dbTypes } from "../../constants";
import { set, get, del } from "automate-redux";
import { getDbType } from "./config";

export const loadDbPreparedQueries = (projectId) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const hasPermission = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_PREPARED_QUERIES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db prepared queries")
      setDbPreparedQueries(dispatch, {})
      resolve()
      return
    }

    scClient.getJSON(`/v1/config/projects/${projectId}/database/prepared-queries`)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const result = data.result ? data.result : []
        const dbPreparedQueries = result.reduce((prev, curr) => {
          const { id, db, ...preparedQueryConfig } = curr

          // Make sure that prepared query object has id in it
          const newPreparedQueryConfig = Object.assign({}, preparedQueryConfig, { id })

          const dbPreparedQuery = prev[db]
          if (dbPreparedQuery) {
            const newDbPreparedQuery = Object.assign({}, dbPreparedQuery)
            newDbPreparedQuery[id] = newPreparedQueryConfig
            return Object.assign({}, prev, { [db]: newDbPreparedQuery })
          }

          return Object.assign({}, prev, { [db]: { [id]: newPreparedQueryConfig } })
        }, {})
        setDbPreparedQueries(dispatch, dbPreparedQueries)
        resolve()
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const savePreparedQueryConfig = (projectId, dbAliasName, id, args, sql) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const preparedQueryConfig = getDbPreparedQuery(getState(), dbAliasName, id)
    const config = Object.assign({}, preparedQueryConfig, { sql, args })

    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/prepared-queries/${id}`, config)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202
        if (!queued) {
          dispatch(set(`dbPreparedQueries.${dbAliasName}.${id}`, config))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const savePreparedQuerySecurityRule = (projectId, dbAliasName, id, rule) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const preparedQueryConfig = getDbPreparedQuery(getState(), dbAliasName, id)
    const config = Object.assign({}, preparedQueryConfig, { rule })

    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/prepared-queries/${id}`, config)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202
        if (!queued) {
          setPreparedQueryRule(dispatch, dbAliasName, id, rule)
        }
        resolve({ queued })

      })
      .catch(ex => reject(ex.toString()))
  })
}

export const deletePreparedQuery = (projectId, dbAliasName, id) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    scClient.delete(`/v1/config/projects/${projectId}/database/${dbAliasName}/prepared-queries/${id}`)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202
        if (!queued) {
          dispatch(del(`dbPreparedQueries.${dbAliasName}.${id}`))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

// Getters
export const getPreparedQuerySecurityRule = (state, dbAliasName, id) => get(state, `dbPreparedQueries.${dbAliasName}.${id}.rule`, {})
export const getDbPreparedQueries = (state, dbAliasName) => get(state, `dbPreparedQueries.${dbAliasName}`, {})
export const getDbPreparedQuery = (state, dbAliasName, preparedQueryId) => get(state, `dbPreparedQueries.${dbAliasName}.${preparedQueryId}`, { id: preparedQueryId, sql: "", args: [], rule: {} })
export const getDbDefaultPreparedQuerySecurityRule = (state, dbAliasName) => get(state, `dbPreparedQueries.${dbAliasName}.default.rule`, {})
export const getDbDefaultCollectionSecurityRule = (state, dbAliasName) => get(state, `dbRules.${dbAliasName}.default.rules`, {})
export const isPreparedQueriesSupported = (state, dbAliasName) => {
  const dbType = getDbType(state, dbAliasName)
  return isPreparedQueriesSupportedForDbType(dbType)
}

export const isPreparedQueriesSupportedForDbType = (dbType) => {
  return [dbTypes.POSTGRESQL, dbTypes.MYSQL, dbTypes.SQLSERVER].some(value => value === dbType)
}

// Setters
export const setPreparedQueryRule = (dispatch, dbAliasName, id, rule) => dispatch(set(`dbPreparedQueries.${dbAliasName}.${id}.rule`, rule))
const setDbPreparedQueries = (dispatch, dbPreparedQueries) => dispatch(set("dbPreparedQueries", dbPreparedQueries))