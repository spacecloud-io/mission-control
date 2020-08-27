import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs, defaultDBRules, defaultPreparedQueryRule, dbTypes } from "../../constants";
import { del, get, set } from "automate-redux";
import eventing from "../eventing";
import { loadCollections } from "./collections";
import { saveColRule } from "./rules";
import { savePreparedQuerySecurityRule } from "./preparedQuery";
import { modifyDbSchema } from './schema';

const { saveEventingConfig } = eventing;

export const loadDbConfig = (projectId) => (dispatch, getState) => {
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

const saveDbConfig = (projectId, dbAliasName, enabled, conn, type, dbName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const dbConfig = { enabled, type, conn, name: dbName }

    scClient.postJSON(`/v1/config/projects/${projectId}/database/${dbAliasName}/config/database-config`, dbConfig)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202
        if (!queued) {
          dispatch(set(`dbConfigs.${dbAliasName}`, dbConfig))
          dispatch(loadDBConnState(projectId, dbAliasName))
            .then(connected => resolve({ connected }))
            .catch(ex => reject(ex))
        } else {
          resolve({ queued: true })
        }
      })
      .catch(ex => reject(ex.toString()))

  })
}

export const addDatabase = (projectId, dbAliasName, dbType, dbName, conn) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const dbConfigs = get(getState(), "dbConfigs", {})
    const isFirstDatabase = Object.keys(dbConfigs).length === 0
    dispatch(saveDbConfig(projectId, dbAliasName, true, conn, dbType, dbName))
      .then(({ queued }) => {
        // Set default security rules for collections and prepared queries in the background
        const hasPermissionToSaveRule = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_RULES], permissionVerbs.MODIFY)
        if (hasPermissionToSaveRule) {
          dispatch(saveColRule(projectId, dbAliasName, "default", defaultDBRules, false))
            .catch(ex => console.error("Error setting default collection rule" + ex.toString()))
        }

        const hasPermissionToCreatePrepareduery = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_PREPARED_QUERIES], permissionVerbs.MODIFY)
        if (hasPermissionToCreatePrepareduery) {
          if (isPreparedQueriesSupportedForDbType(dbType)) {
            dispatch(savePreparedQuerySecurityRule(projectId, dbAliasName, "default", defaultPreparedQueryRule))
              .catch(ex => console.error("Error setting default prepared query rule" + ex.toString()))
          }
        }

        // If this is the first database, then auto configure it as the eventing database 
        const hasPermissionToConfigureEventing = checkResourcePermissions(getState(), projectId, [configResourceTypes.EVENTING_CONFIG], permissionVerbs.MODIFY)
        if (isFirstDatabase && hasPermissionToConfigureEventing) {
          dispatch(saveEventingConfig(projectId, true, dbAliasName))
            .then(() => resolve({ queued, enabledEventing: true }))
            .catch(() => reject())
          return
        }
        resolve({ queued, enabledEventing: false })
      })
      .catch(ex => reject(ex))
  })
}

export const enableDb = (projectId, dbAliasName, conn) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const { type, name } = getDbConfig(getState(), dbAliasName)

    dispatch(saveDbConfig(projectId, dbAliasName, true, conn, type, name))
      .then(({ queued, connected }) => resolve({ queued, connected }))
      .catch(ex => reject(ex))
  })
}

export const disableDb = (projectId, dbAliasName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const { type, name, conn } = getDbConfig(getState(), dbAliasName)
    dispatch(saveDbConfig(projectId, dbAliasName, false, conn, type, name))
      .then(({ queued }) => resolve({ queued }))
      .catch(ex => reject(ex))
  })
}

export const removeDbConfig = (projectId, dbAliasName) => (dispatch, getState) => {
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
            dispatch(saveEventingConfig(projectId, false, ""))
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

export const changeDbName = (projectId, dbAliasName, dbName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {

    const { conn, type } = getDbConfig(getState(), dbAliasName)

    dispatch(saveDbConfig(projectId, dbAliasName, true, conn, type, dbName))
      .then(() => {
        const hasPermissionToChangeSchema = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_SCHEMA], permissionVerbs.MODIFY)
        if (!hasPermissionToChangeSchema) {
          resolve()
          return
        }
        dispatch(modifyDbSchema(projectId, dbAliasName))
          .then(({ queued }) => resolve({ queued }))
          .catch(ex => reject(ex))
      })
      .catch(ex => reject(ex))
  })
}

export const isPreparedQueriesSupportedForDbType = (dbType) => {
  return [dbTypes.POSTGRESQL, dbTypes.MYSQL, dbTypes.SQLSERVER].some(value => value === dbType)
}

// Getters & Setters
export const getDbConfig = (state, dbAliasName) => get(state, `dbConfigs.${dbAliasName}`, {})