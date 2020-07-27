import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";

export function loadClusterSettings() {
  return new Promise((resolve, reject) => {
    client.cluster.fetchConfig()
      .then(clusterConfig => {
        store.dispatch(set("clusterConfig", clusterConfig))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function loadPermissions() {
  return new Promise((resolve, reject) => {
    client.cluster.fetchPermissions()
      .then(permissions => {
        setPermissions(permissions)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function loadAPIToken(projectId) {
  return new Promise((resolve, reject) => {
    client.cluster.fetchAPIToken(projectId)
      .then((token) => {
        setAPIToken(token)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function saveClusterSetting(key, value) {
  return new Promise((resolve, reject) => {
    const { credentials, ...config } = get(store.getState(), "clusterConfig", {})
    const newConfig = Object.assign({}, config, { [key]: value })
    client.cluster.setConfig(newConfig)
      .then(() => {
        store.dispatch(set("clusterConfig", newConfig))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function loadClusterEnv() {
  return new Promise((resolve, reject) => {
    client.cluster.fetchEnv()
      .then(env => {
        setEnv(env)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function login(user, key) {
  return new Promise((resolve, reject) => {
    client.cluster.login(user, key)
      .then(token => {
        setToken(token)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function refreshClusterTokenIfPresent() {
  return new Promise((resolve, reject) => {
    const token = getToken()

    if (!token) {
      resolve()
      return
    }

    client.cluster.refreshToken(token)
      .then((newToken) => {
        setToken(newToken)
        resolve()
      })
      .catch((ex) => {
        localStorage.removeItem("token")
        reject(ex)
      })
  })
}

export function applyClusterLicense(clusterName, licenseKey, licenseValue) {
  return new Promise((resolve, reject) => {
    client.cluster.setClusterLicense(clusterName, licenseKey, licenseValue)
      .then(() => {
        loadClusterEnv()
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function removeClusterLicense() {
  return new Promise((resolve, reject) => {
    client.cluster.removeClusterLicense()
      .then(() => {
        loadClusterEnv()
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function getEnv(state) {
  return get(state, "env", {})
}

export function setEnv(env) {
  store.dispatch(set("env", env))
}

export function isProdMode(state) {
  const env = getEnv(state)
  return get(env, "isProd", false)
}

export function isClusterUpgraded(state) {
  const { plan } = getEnv(state)
  if (!plan) return false
  return !plan.startsWith("space-cloud-open") ? true : false
}

export function getToken() {
  return localStorage.getItem("token")
}

function setToken(token) {
  localStorage.setItem("token", token)
}

function setPermissions(permissions) {
  store.dispatch(set("permissions", permissions))
}

export function getPermisions(state) {
  return get(state, "permissions", [])
}

export function getAPIToken(state) {
  return get(state, "apiToken", "")
}

export function setAPIToken(token) {
  store.dispatch(set("apiToken", token))
}

export function getLoginURL(state) {
  const env = getEnv(state)
  return get(env, "loginURL")
}

export function isLoggedIn(state) {
  const prodMode = isProdMode(state)
  const token = getToken()

  if (prodMode && !token) {
    return false
  }

  return true
}