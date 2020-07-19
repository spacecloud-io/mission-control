import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray } from "../utils";

export const loadIngressRoutes = (projectId) => {
  return new Promise((resolve, reject) => {
    client.routing.fetchIngressRoutes(projectId)
      .then(ingressRoutes => {
        setIngressRoutes(ingressRoutes)
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

export const saveIngressRouteConfig = (projectId, routeId, config) => {
  return new Promise((resolve, reject) => {
    const rule = getIngressRouteSecurityRule(store.getState(), routeId)
    const newConfig = Object.assign({}, config, { rule })
    client.routing.setRoutingConfig(projectId, routeId, config)
      .then(() => {
        const ingressRoutes = getIngressRoutes(store.getState())
        const newIngressRoutes = upsertArray(ingressRoutes, obj => obj.id === routeId, () => newConfig)
        setIngressRoutes(newIngressRoutes)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveIngressRouteRule = (projectId, routeId, rule) => {
  return new Promise((resolve, reject) => {
    const oldConfig = getIngressRoute(store.getState(), routeId)
    const newConfig = Object.assign({}, oldConfig, {}, { rule })
    client.routing.setRoutingConfig(projectId, routeId, newConfig)
      .then(() => {
        setIngressRouteRule(routeId, rule)
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
        setIngressRoutes(newIngressRoutes)
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
export const getIngressRouteSecurityRule = (state, id) => {
  const ingressRoutes = getIngressRoutes(state)
  const index = ingressRoutes.findIndex(obj => obj.id === id)
  return get(ingressRoutes[index], "rule", {})
}

export const getIngressRouteURL = (state, id) => {
  const ingressRoutes = getIngressRoutes(state)
  const index = ingressRoutes.findIndex(obj => obj.id === id)
  return get(ingressRoutes[index], "source.url", "")
}

export const setIngressRoutes = (routes) => store.dispatch(set(`ingressRoutes`, routes))

export const setIngressRouteRule = (routeId, rule) => {
  const ingressRoutes = getIngressRoutes(store.getState())
  const newIngressRoutes = ingressRoutes.map(obj => obj.id === routeId ? Object.assign({}, obj, { rule }) : obj)
  setIngressRoutes(newIngressRoutes)
}

const getIngressRoute = (state, routeId) => {
  const ingressRoutes = getIngressRoutes(state)
  const index = ingressRoutes.findIndex(obj => obj.id === routeId)
  return (index === -1) ? {} : ingressRoutes[index]
} 
export const getIngressRoutesGlobalConfig = (state) => get(state, "ingressRoutesGlobal", {})
const setIngressRoutesGlobalConfig = (config) => store.dispatch(set("ingressRoutesGlobal", config)) 
