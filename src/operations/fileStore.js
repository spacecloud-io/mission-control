import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray } from "../utils";

export const loadFileStoreConnState = (projectId) => {
  return new Promise((resolve, reject) => {
    client.fileStore.getConnectionState(projectId)
      .then(connected => {
        store.dispatch(set(`extraConfig.${projectId}.fileStore.connected`, connected))
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
    client.fileStore.getConfig(projectId)
      .then((fileStoreRules) => {
        store.dispatch(set("fileStoreRules", fileStoreRules))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setFileStoreConfig = (projectId, config) => {
  return new Promise((resolve, reject) => {
    client.fileStore.setConfig(projectId, config)
      .then(() => {
        store.dispatch(set("fileStoreConfig", config))
        store.dispatch(set(`extraConfig.${projectId}.fileStore.connected`, config.enabled))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setFileStoreRule = (projectId, ruleName, rule) => {
  return new Promise((resolve, reject) => {
    const fileRule = Object.assign({}, rule, { id: ruleName })
    client.fileStore.setRule(projectId, ruleName, fileRule)
      .then(() => {
        const fileStoreRules = get(store.getState(), "fileStoreRules", [])
        const newFileStoreRules = upsertArray(fileStoreRules, obj => obj.id === ruleName, () => fileRule)
        store.dispatch(set("fileStoreRules", newFileStoreRules))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteFileStoreRule = (projectId, ruleName) => {
  return new Promise((resolve, reject) => {
    client.fileStore.deleteRule(projectId, ruleName)
      .then(() => {
        const fileStoreRules = get(store.getState(), "fileStoreRules", [])
        const newFileStoreRules = fileStoreRules.filter(obj => obj.id !== ruleName)
        store.dispatch(set("fileStoreRules", newFileStoreRules))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}
