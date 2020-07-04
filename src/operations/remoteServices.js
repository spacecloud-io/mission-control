import { set, del } from "automate-redux";
import client from "../client";
import store from "../store";

export const loadRemoteServices = (projectId) => {
  return new Promise((resolve, reject) => {
    client.remoteServices.fetchServices(projectId)
      .then((result = []) => {
        const remoteServices = result.reduce((prev, curr) => Object.assign({}, prev, { [curr.id]: curr }), {})
        store.dispatch(set("remoteServices", remoteServices))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setRemoteService = (projectId, serviceId, config) => {
  return new Promise((resolve, reject) => {
    client.remoteServices.setServiceConfig(projectId, serviceId, config)
      .then(() => {
        store.dispatch(set(`remoteServices.${serviceId}`, config))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteRemoteService = (projectId, serviceId) => {
  return new Promise((resolve, reject) => {
    client.remoteServices.deleteServiceConfig(projectId, serviceId)
      .then(() => {
        store.dispatch(del(`remoteServices.${serviceId}`))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}