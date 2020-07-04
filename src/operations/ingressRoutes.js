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

export const setIngressRoute = (projectId, routeId, config) => {
  return new Promise((resolve, reject) => {
    client.routing.setRoutingConfig(projectId, routeId, config)
      .then(() => {
        const ingressRoutes = get(store.getState(), "ingressRoutes", [])
        const newIngressRoutes = upsertArray(ingressRoutes, obj => obj.id === routeId, config)
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