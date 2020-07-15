import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray } from "../utils";

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
    client.fileStore.getConfig(projectId)
      .then((fileStoreConfig) => {
        store.dispatch(set("fileStoreConfig", fileStoreConfig))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadFileStoreRules = (projectId) => {
  return new Promise((resolve, reject) => {
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
      .then(() => {
        store.dispatch(set("fileStoreConfig", config))
        store.dispatch(setFileStoreConnState(config.enabled))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveFileStoreRule = (projectId, ruleName, rule) => {
  return new Promise((resolve, reject) => {
    const fileRule = Object.assign({}, rule, { id: ruleName })
    client.fileStore.setRule(projectId, ruleName, fileRule)
      .then(() => {
        const fileStoreRules = get(store.getState(), "fileStoreRules", [])
        const newFileStoreRules = upsertArray(fileStoreRules, obj => obj.id === ruleName, () => fileRule)
        setFileStoreRules(newFileStoreRules)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveFileStoreSecurityRule = (projectId, ruleName, securityRule) => {
  const rule = getFileStoreRule(store.getState(), ruleName)
  const newRule = Object.assign({}, rule, { rule: securityRule })
  return saveFileStoreRule(projectId, ruleName, newRule)
}

export const deleteFileStoreRule = (projectId, ruleName) => {
  return new Promise((resolve, reject) => {
    client.fileStore.deleteRule(projectId, ruleName)
      .then(() => {
        const fileStoreRules = get(store.getState(), "fileStoreRules", [])
        const newFileStoreRules = fileStoreRules.filter(obj => obj.id !== ruleName)
        setFileStoreRules(newFileStoreRules)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}


// Getters && setters

export const getFileStoreRules = (state) => get(state, "fileStoreRules", [])
export const getFileStoreRule = (state, id) => {
  const fileStoreRules = getFileStoreRules(state)
  const index = fileStoreRules.findIndex(obj => obj.id === id)
  if (index === -1) return {}
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