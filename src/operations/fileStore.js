import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray, checkResourcePermissions } from "../utils";
import { configResourceTypes, permissionVerbs, defaultFileRule } from "../constants";

export const loadFileStoreConnState = (projectId) => {
  return new Promise((resolve, reject) => {
    client.fileStore.getConnectionState(projectId)
      .then(connected => {
        store.dispatch(setFileStoreConnState(connected))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadFileStoreConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.FILESTORE_CONFIG], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch file store config")
      setFileStoreConfig({})
      resolve()
      return
    }

    client.fileStore.getConfig(projectId)
      .then((fileStoreConfig) => {
        setFileStoreConfig(fileStoreConfig)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadFileStoreRules = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.FILESTORE_RULES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch file store rules")
      setFileStoreRules([])
      resolve()
      return
    }

    client.fileStore.getRules(projectId)
      .then((fileStoreRules) => {
        setFileStoreRules(fileStoreRules)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveFileStoreConfig = (projectId, config) => {
  return new Promise((resolve, reject) => {
    client.fileStore.setConfig(projectId, config)
      .then(({ queued }) => {
        if (!queued) {
          setFileStoreConfig(config)
          setFileStoreConnState(config.enabled)
          if (getFileStoreRules(store.getState()).length === 0) {
            saveFileStoreRule(projectId, "DefaultRule", { prefix: "/", rule: defaultFileRule })
              .then(({ queued }) => resolve({ queued }))
              .catch(ex => reject(ex))
            return;
          }
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveFileStoreRule = (projectId, ruleName, rule) => {
  return new Promise((resolve, reject) => {
    const fileRule = Object.assign({}, rule, { id: ruleName })
    client.fileStore.setRule(projectId, ruleName, fileRule)
      .then(({ queued }) => {
        if (!queued) {
          const fileStoreRules = get(store.getState(), "fileStoreRules", [])
          const newFileStoreRules = upsertArray(fileStoreRules, obj => obj.id === ruleName, () => fileRule)
          setFileStoreRules(newFileStoreRules)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveFileStoreSecurityRule = (projectId, ruleName, securityRule) => {
  const rule = getFileStoreRule(store.getState(), ruleName)
  const newRule = Object.assign({}, rule, { rule: securityRule })
  return saveFileStoreRule(projectId, ruleName, newRule)
}

export const saveFileStorePrefix = (projectId, ruleName, prefix) => {
  const rule = getFileStoreRule(store.getState(), ruleName)
  const newRule = Object.assign({}, rule, { prefix })
  return saveFileStoreRule(projectId, ruleName, newRule)
}

export const deleteFileStoreRule = (projectId, ruleName) => {
  return new Promise((resolve, reject) => {
    client.fileStore.deleteRule(projectId, ruleName)
      .then(({ queued }) => {
        if (!queued) {
          const fileStoreRules = get(store.getState(), "fileStoreRules", [])
          const newFileStoreRules = fileStoreRules.filter(obj => obj.id !== ruleName)
          setFileStoreRules(newFileStoreRules)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}


// Getters && setters

export const getFileStoreRules = (state) => get(state, "fileStoreRules", [])
export const getFileStoreRule = (state, id) => {
  const fileStoreRules = getFileStoreRules(state)
  const index = fileStoreRules.findIndex(obj => obj.id === id)
  return index === -1 ? {} : fileStoreRules[index]
}

export const getFileStoreSecurityRule = (state, id) => {
  const fileStoreRules = getFileStoreRules(state)
  const index = fileStoreRules.findIndex(obj => obj.id === id)
  if (index === -1) return {}
  const rule = fileStoreRules[index]
  return rule ? rule.rule : {}
}
export const getFileStoreConfig = (state) => get(state, "fileStoreConfig", {})
const setFileStoreConnState = (connected) => store.dispatch(set("fileStoreConnState", connected))
export const getFileStoreConnState = (state) => get(state, "fileStoreConnState", false)
const setFileStoreRules = (rules) => store.dispatch(set("fileStoreRules", rules))
export const setFileStoreSecurityRule = (ruleId, securityRule) => {
  const rules = getFileStoreRules(store.getState())
  const newRules = rules.map(obj => {
    if (obj.id === ruleId) return Object.assign({}, obj, { rule: securityRule })
    return obj
  })
  setFileStoreRules(newRules)
}

const setFileStoreConfig = (fileStoreConfig) => store.dispatch(set("fileStoreConfig", fileStoreConfig)) 