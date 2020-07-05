import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray } from "../utils";

export const loadSecrets = (projectId) => {
  return new Promise((resolve, reject) => {
    client.secrets.fetchSecrets(projectId)
      .then(secrets => {
        store.dispatch(set("secrets", secrets))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveSecret = (projectId, secretConfig) => {
  return new Promise((resolve, reject) => {
    client.secrets.setSecret(projectId, secretConfig)
      .then(() => {
        const secrets = get(store.getState(), "secrets", [])
        const newSecrets = upsertArray(secrets, obj => obj.id === secretConfig.id, () => secretConfig)
        store.dispatch(set("secrets", newSecrets))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteSecret = (projectId, secretId) => {
  return new Promise((resolve, reject) => {
    client.secrets.deleteSecret(projectId, secretId)
      .then(() => {
        const secrets = get(store.getState(), "secrets", [])
        const newSecrets = secrets.filter(obj => obj.id === secretId)
        store.dispatch(set("secrets", newSecrets))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveSecretKey = (projectId, secretId, key, value) => {
  return new Promise((resolve, reject) => {
    client.secrets.setSecretKey(projectId, secretId, key, value)
      .then(() => {
        const secrets = get(store.getState(), "secrets", [])
        const newSecrets = secrets.map(obj => {
          if (obj.id !== secretId) return obj
          const newData = Object.assign({}, obj.data, { [key]: value })
          return Object.assign({}, obj, { data: newData })
        })
        store.dispatch(set("secrets", newSecrets))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteSecretKey = (projectId, secretId, key) => {
  return new Promise((resolve, reject) => {
    client.secrets.deleteSecretKey(projectId, secretId, key)
      .then(() => {
        const secrets = get(store.getState(), "secrets", [])
        const newSecrets = secrets.map(obj => {
          if (obj.id !== secretId) return obj
          const newData = Object.assign({}, obj.data)
          delete newData[key]
          return Object.assign({}, obj, { data: newData })
        })
        store.dispatch(set("secrets", newSecrets))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveRootPath = (projectId, secretId, rootPath) => {
  return new Promise((resolve, reject) => {
    client.secrets.setRootPath(projectId, secretId, rootPath)
      .then(() => {
        const secrets = get(store.getState(), "secrets", [])
        const newSecrets = secrets.map(obj => {
          if (obj.id !== secretId) return obj
          const newData = Object.assign({}, obj.data, { rootPath })
          return Object.assign({}, obj, { data: newData })
        })
        store.dispatch(set("secrets", newSecrets))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

// Getters
export const getSecrets = (state) => get(state, "secrets", [])