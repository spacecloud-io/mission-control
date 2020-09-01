import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";

export function loadClusterSettings() {
  return new Promise((resolve, reject) => {
    client.cluster.fetchConfig()
      .then(clusterConfig => {
        setClusterConfig(clusterConfig)
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
      .catch(ex => reject(ex))
  })
}

export function applyOfflineClusterLicense(licenseKey) {
  return new Promise((resolve, reject) => {
    client.cluster.setOfflineClusterLicense(licenseKey)
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