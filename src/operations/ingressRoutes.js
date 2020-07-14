import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray } from "../utils";

export const loadIngressRoutes = (projectId) => {
  return new Promise((resolve, reject) => {
    client.routing.fetchIngressRoutes(projectId)
      .then(ingressRoutes => {
        store.dispatch(set("ingressRoutes", ingressRoutes))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadIngressRoutesGlobalConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    client.routing.fetchIngressRoutesGlobalConfig(projectId)
      .then(ingressRoutesGlobalConfig => {
        store.dispatch(set("ingressRoutesGlobal", ingressRoutesGlobalConfig))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveIngressRoute = (projectId, routeId, config) => {
  return new Promise((resolve, reject) => {
    client.routing.setRoutingConfig(projectId, routeId, config)
      .then(() => {
        const ingressRoutes = get(store.getState(), "ingressRoutes", [])
        const newIngressRoutes = upsertArray(ingressRoutes, obj => obj.id === routeId, () => config)
        store.dispatch(set(`ingressRoutes`, newIngressRoutes))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteIngressRoute = (projectId, routeId) => {
  return new Promise((resolve, reject) => {
    client.routing.deleteRoutingConfig(projectId, routeId)
      .then(() => {
        const ingressRoutes = get(store.getState(), "ingressRoutes", [])
        const newIngressRoutes = ingressRoutes.filter(obj => obj.id !== routeId)
        store.dispatch(set(`ingressRoutes`, newIngressRoutes))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveIngressGlobalRequestHeaders = (projectId, headers) => {
  return new Promise((resolve, reject) => {
    const globalConfig = getIngressRoutesGlobalConfig(store.getState())
    const newGlobalConfig = Object.assign({}, globalConfig, { headers: headers })
    client.routing.setRoutingGlobalConfig(projectId, newGlobalConfig)
      .then(() => {
        setIngressRoutesGlobalConfig(newGlobalConfig)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveIngressGlobalResponseHeaders = (projectId, headers) => {
  return new Promise((resolve, reject) => {
    const globalConfig = getIngressRoutesGlobalConfig(store.getState())
    const newGlobalConfig = Object.assign({}, globalConfig, { resHeaders: headers })
    client.routing.setRoutingGlobalConfig(projectId, newGlobalConfig)
      .then(() => {
        setIngressRoutesGlobalConfig(newGlobalConfig)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

// Getters
export const getIngressRoutes = (state) => get(state, "ingressRoutes", [])
export const getIngressRoutesGlobalConfig = (state) => get(state, "ingressRoutesGlobal", {})
const setIngressRoutesGlobalConfig = (config) => store.dispatch(set("ingressRoutesGlobal", config)) 