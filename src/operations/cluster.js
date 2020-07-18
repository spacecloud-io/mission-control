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
        localStorage.setItem("isProd", String(env.isProd))
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

export function refreshClusterTokenIfNeeded() {
  return new Promise((resolve, reject) => {
    const prodMode = isProdMode()
    const token = getToken()
    if (!prodMode) {
      resolve(true)
      return
    }
    if (!token) {
      resolve(false)
    }
    client.cluster.refreshToken(token)
      .then((newToken) => {
        setToken(newToken)
        resolve(true)
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
        const env = getEnv(store.getState())
        const newEnv = Object.assign({}, env, { clusterName, licenseKey, licenseValue })
        setEnv(newEnv)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export function removeClusterLicense() {
  return new Promise((resolve, reject) => {
    client.cluster.setClusterLicense("", "", "")
      .then(() => {
        const env = getEnv(store.getState())
        const newEnv = Object.assign({}, env)
        delete newEnv["clusterName"]
        delete newEnv["licenseKey"]
        delete newEnv["licenseValue"]
        setEnv(newEnv)
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

export function isProdMode() {
  return localStorage.getItem("isProd") === "true" ? true : false
}

export function isClusterUpgraded(state) {
  const { licenseKey } = getEnv(state)
  return licenseKey ? true : false
}

export function getToken() {
  return localStorage.getItem("token")
}

function setToken(token) {
  localStorage.setItem("token", token)
}