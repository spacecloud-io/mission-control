import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs } from "../../constants";
import { set, get } from "automate-redux";

export const loadDbRules = (projectId) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const hasPermission = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_RULES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db rules")
      dispatch(set("dbRules", {}))
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
      dispatch(set("dbRules", dbRules))
      resolve()
    })
    .catch(ex => reject(ex.toString()))
  })
}

export const saveColRule = (projectId, dbAliasName, colName, securityRules, isRealtimeEnabled) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const collectionRules = { rules: securityRules, isRealtimeEnabled }

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
          dispatch(set(`dbRules.${dbAliasName}.${colName}`, collectionRules))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const saveColSecurityRules = (projectId, dbAliasName, colName, securityRules) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const collectionRules = get(getState(), `dbRules.${dbAliasName}.${colName}`, { isRealtimeEnabled: false, rules: {} })
    const newCollectionRules = Object.assign({}, collectionRules, { rules: securityRules })

    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/collections/${colName}/rules`, {
      isRealtimeEnabled: typeof newCollectionRules.isRealtimeEnabled === "string" ? false : newCollectionRules.isRealtimeEnabled, ...newCollectionRules
    })
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202
        if (!queued) {
          dispatch(set(`dbRules.${dbAliasName}.${colName}.rules`, securityRules))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}