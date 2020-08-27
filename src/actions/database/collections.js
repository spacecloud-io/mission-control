import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs } from "../../constants";
import { set, get, del } from "automate-redux";

export const loadCollections = (projectId, dbAliasName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    scClient.getJSON(`/v1/external/projects/${projectId}/database/${dbAliasName}/list-collections`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const result = data.result ? data.result : []
      dispatch(set(`dbCollections.${dbAliasName}`, result))
      resolve()
    })
    .catch(ex => reject(ex.toString()))
  })
}

export const saveColRealtimeEnabled = (projectId, dbAliasName, colName, isRealtimeEnabled) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const collectionRules = get(getState(), `dbRules.${dbAliasName}.${colName}`, { isRealtimeEnabled: false, rules: {} })
    const newCollectionRules = Object.assign({}, collectionRules, { isRealtimeEnabled })

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
          dispatch(set(`dbRules.${dbAliasName}.${colName}.isRealtimeEnabled`, isRealtimeEnabled))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const untrackCollection = (projectId, dbAliasName, colName) => (dispatch, getState) => {
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

        dispatch(del(`dbSchemas.${dbAliasName}.${colName}`))
        dispatch(del(`dbRules.${dbAliasName}.${colName}`))
        dispatch(set(`dbCollections.${dbAliasName}`, newCollectionsList))
      }
      resolve({ queued })
    })
    .catch(ex => reject(ex.toString()))
  })
}