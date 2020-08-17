import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray, checkResourcePermissions } from "../utils";
import { configResourceTypes, permissionVerbs } from "../constants";

export const loadSecrets = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.SECRETS], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch secrets")
      setSecrets([])
      resolve()
      return
    }

    client.secrets.fetchSecrets(projectId)
      .then(secrets => {
        setSecrets(secrets)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveSecret = (projectId, secretConfig) => {
  return new Promise((resolve, reject) => {
    client.secrets.setSecret(projectId, secretConfig)
      .then(({ queued }) => {
        if (!queued) {
          const secrets = get(store.getState(), "secrets", [])
          const newSecrets = upsertArray(secrets, obj => obj.id === secretConfig.id, () => secretConfig)
          setSecrets(newSecrets)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteSecret = (projectId, secretId) => {
  return new Promise((resolve, reject) => {
    client.secrets.deleteSecret(projectId, secretId)
      .then(({ queued }) => {
        if (!queued) {
          const secrets = get(store.getState(), "secrets", [])
          const newSecrets = secrets.filter(obj => obj.id !== secretId)
          setSecrets(newSecrets)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveSecretKey = (projectId, secretId, key, value) => {
  return new Promise((resolve, reject) => {
    client.secrets.setSecretKey(projectId, secretId, key, value)
      .then(({ queued }) => {
        if (!queued) {
          const secrets = get(store.getState(), "secrets", [])
          const newSecrets = secrets.map(obj => {
            if (obj.id !== secretId) return obj
            const newData = Object.assign({}, obj.data, { [key]: value })
            return Object.assign({}, obj, { data: newData })
          })
          setSecrets(newSecrets)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteSecretKey = (projectId, secretId, key) => {
  return new Promise((resolve, reject) => {
    client.secrets.deleteSecretKey(projectId, secretId, key)
      .then(({ queued }) => {
        if (!queued) {
          const secrets = get(store.getState(), "secrets", [])
          const newSecrets = secrets.map(obj => {
            if (obj.id !== secretId) return obj
            const newData = Object.assign({}, obj.data)
            delete newData[key]
            return Object.assign({}, obj, { data: newData })
          })
          setSecrets(newSecrets)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveRootPath = (projectId, secretId, rootPath) => {
  return new Promise((resolve, reject) => {
    client.secrets.setRootPath(projectId, secretId, rootPath)
      .then(({ queued }) => {
        if (!queued) {
          const secrets = get(store.getState(), "secrets", [])
          const newSecrets = secrets.map(obj => {
            if (obj.id !== secretId) return obj
            return Object.assign({}, obj, { rootPath })
          })
          setSecrets(newSecrets)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

// Getters
export const getSecrets = (state) => get(state, "secrets", [])
const setSecrets = (secrets) => store.dispatch(set("secrets", secrets))