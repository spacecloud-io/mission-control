import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs } from "../../constants";
import { del, get, set } from "automate-redux";
import eventing from "../eventing";
import {loadCollections} from "./collections";

export const loadConfig = (projectId) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_CONFIG], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db config")
      dispatch(set("dbConfigs", {}))
      resolve()
      return
    }

    scClient.getJSON(`/v1/config/projects/${projectId}/database/config`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const result = data.result ? data.result : []
      const dbConfigs = result.reduce((prev, curr) => {
        const [dbAliasName, config] = Object.entries(curr)[0]
        return Object.assign({}, prev, { [dbAliasName]: config })
      }, {})
      dispatch(set("dbConfigs", dbConfigs))
      resolve()

    })
    .catch(ex => reject(ex.toString()))
  })
}

export const removeConfig = (projectId, dbAliasName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    scClient.delete(`/v1/config/projects/${projectId}/database/${dbAliasName}/config/database-config`)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202;
        if (!queued) {
          dispatch(del(`dbConfigs.${dbAliasName}`))
          dispatch(del(`dbSchemas.${dbAliasName}`))
          dispatch(del(`dbRules.${dbAliasName}`))
          dispatch(del(`dbPreparedQueries.${dbAliasName}`))
        }

        // Disable eventing if the removed db is eventing db
        const hasPermissionToConfigureEventing = checkResourcePermissions(getState(), projectId, [configResourceTypes.EVENTING_CONFIG], permissionVerbs.MODIFY)
        if (hasPermissionToConfigureEventing) {
          const eventingDB = get(getState(), "eventingConfig.dbAlias", "")
          if (dbAliasName === eventingDB) {
            dispatch(eventing.saveConfig(projectId, false, ""))
              .then(({ queued }) => resolve({ queued, disabledEventing: true }))
              .catch(ex => reject(ex))
            return
          }
        }
        resolve({ queued, disabledEventing: false })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const loadDBConnState = (projectId, dbAliasName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    scClient.getJSON(`/v1/external/projects/${projectId}/database/${dbAliasName}/connection-state`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const connected = data.result
      dispatch(set(`dbConnState.${dbAliasName}`, connected))
      if (connected) {
        dispatch(loadCollections(projectId, dbAliasName))
          .then(() => resolve(connected))
          .catch(ex => reject(ex))
        return
      }
      resolve(connected)
    })
    .catch(ex => reject(ex.toString()))
  })
}