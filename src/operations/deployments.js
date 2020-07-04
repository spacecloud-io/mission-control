import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray } from "../utils";

export const loadServiceRoutes = (projectId) => {
  return new Promise((resolve, reject) => {
    client.deployments.fetchDeploymentRoutes(projectId)
      .then((res = []) => {
        const serviceRoutes = res.reduce((prev, curr) => {
          if (!prev[curr.id]) {
            return Object.assign({}, prev, { [curr.id]: [curr] })
          }
          const oldRoutes = prev[curr.id]
          const newRoutes = [...oldRoutes, curr]
          return Object.assign({}, prev, { [curr.id]: newRoutes })
        }, {})
        store.dispatch(set("serviceRoutes", serviceRoutes))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadServices = (projectId) => {
  return new Promise((resolve, reject) => {
    client.deployments.fetchDeployments(projectId)
      .then((deployments) => {
        store.dispatch(set("services", deployments))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setService = (projectId, serviceId, version, serviceConfig) => {
  return new Promise((resolve, reject) => {
    client.deployments.setDeploymentConfig(projectId, serviceId, version, serviceConfig)
      .then(() => {
        const services = get(store.getState(), "services", [])
        const newServices = upsertArray(services, obj => obj.id === serviceConfig.id && obj.version === version, () => serviceConfig)
        store.dispatch(set("services", newServices))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteService = (projectId, serviceId, version) => {
  return new Promise((resolve, reject) => {
    client.deployments.deleteDeploymentConfig(projectId, serviceId, version)
      .then(() => {
        const services = get(store.getState(), "services", [])
        const newServices = services.filter(obj => !(obj.id === serviceId && obj.version === version));
        store.dispatch(set("services", newServices))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setServiceRoutes = (projectId, serviceId, serviceRoutes) => {
  return new Promise((resolve, reject) => {
    client.deployments.setDeploymentRoutes(projectId, serviceId, serviceRoutes)
      .then(() => {
        store.dispatch(set(`serviceRoutes.${serviceId}`, serviceRoutes))
        resolve();
      })
      .catch(ex => reject(ex))
  })
}