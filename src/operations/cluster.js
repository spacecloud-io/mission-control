import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { getAPIToken } from "./projects";

export function loadClusterSettings() {
  return new Promise((resolve, reject) => {
    client.cluster.fetchConfig()
      .then(clusterConfig => {
        setClusterConfig(clusterConfig)
        resolve()
      })
      .catch(error => reject(error))
  })
}

export function loadPermissions() {
  return new Promise((resolve, reject) => {
    client.cluster.fetchPermissions()
      .then(permissions => {
        setPermissions(permissions)
        resolve()
      })
      .catch(error => reject(error))
  })
}

export function saveClusterSetting(key, value) {
  return new Promise((resolve, reject) => {
    const config = getClusterConfig(store.getState())
    const newConfig = Object.assign({}, config, { [key]: value })
    client.cluster.setConfig(newConfig)
      .then(({ queued }) => {
        if (!queued) {
          setClusterConfig(newConfig)
        }
        resolve({ queued })
      })
      .catch(error => reject(error))
  })
}

export function loadClusterEnv(projectId) {
  return new Promise((resolve, reject) => {
    client.cluster.fetchEnv()
      .then(env => {
        setEnv(env)
        getScLatestVersion(projectId, env.version)
        resolve()
      })
      .catch(error => reject(error))
  })
}

export function login(user, key) {
  return new Promise((resolve, reject) => {
    client.cluster.login(user, key)
      .then(token => {
        setToken(token)
        resolve()
      })
      .catch(error => reject(error))
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
      .then(({ refreshed, token }) => {
        if (!refreshed) {
          localStorage.removeItem("token")
        } else {
          setToken(token)
        }

        resolve()
      })
      .catch((ex) => {
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
      .catch(error => reject(error))
  })
}

export function applyOfflineClusterLicense(licenseKey) {
  return new Promise((resolve, reject) => {
    client.cluster.setOfflineClusterLicense(licenseKey)
      .then(() => {
        loadClusterEnv()
        resolve()
      })
      .catch(error => reject(error))
  })
}

export function removeClusterLicense() {
  return new Promise((resolve, reject) => {
    client.cluster.removeClusterLicense()
      .then(() => {
        loadClusterEnv()
        resolve()
      })
      .catch(error => reject(error))
  })
}

function getScLatestVersion(projectId, currentVersion) {
  return new Promise((resolve, reject) => {
    const internalToken = getAPIToken(store.getState())
    client.cluster.fetchScLatestVersion(projectId, currentVersion, () => internalToken)
    .then((latestVersion) => {
      setScLatestVersion(latestVersion)
      resolve()
    })
    .catch(error => reject(error))
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
  store.dispatch(set("permissions", permissions ? permissions : []))
}

export function getPermisions(state) {
  return get(state, "permissions", [])
}

const setClusterConfig = (clusterConfig) => store.dispatch(set("clusterConfig", clusterConfig ? clusterConfig : {}))
export const getClusterConfig = (state) => get(state, "clusterConfig", {})

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

const setScLatestVersion = (latestVersion) => store.dispatch(set("scLatestVersion", latestVersion))