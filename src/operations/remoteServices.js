import { set, del, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { checkResourcePermissions } from "../utils";
import { configResourceTypes, permissionVerbs } from "../constants";

export const loadRemoteServices = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.REMOTE_SERVICES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch remote services")
      setRemoteServices({})
      resolve()
      return
    }

    client.remoteServices.fetchServices(projectId)
      .then((result = []) => {
        const remoteServices = result.reduce((prev, curr) => Object.assign({}, prev, { [curr.id]: curr }), {})
        setRemoteServices(remoteServices)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveRemoteService = (projectId, serviceId, config) => {
  return new Promise((resolve, reject) => {
    client.remoteServices.setServiceConfig(projectId, serviceId, config)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`remoteServices.${serviceId}`, config))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteRemoteService = (projectId, serviceId) => {
  return new Promise((resolve, reject) => {
    client.remoteServices.deleteServiceConfig(projectId, serviceId)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(del(`remoteServices.${serviceId}`))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveRemoteServiceEndpoint = (projectId, serviceId, endpointId, endpointConfig) => {
  const state = store.getState()
  const endpoints = getRemoteServiceEndpoints(state, serviceId)
  const rule = getRemoteEndpointSecurityRule(state, serviceId, endpointId)
  const newEndpointConfig = Object.assign({}, { rule }, endpointConfig)
  const newEndpoints = Object.assign({}, endpoints, { [endpointId]: newEndpointConfig })
  const serviceConfig = getRemoteServiceConfig(state, serviceId)
  const newServiceConfig = Object.assign({}, serviceConfig, { endpoints: newEndpoints })
  return saveRemoteService(projectId, serviceId, newServiceConfig)
}

export const saveRemoteServiceEndpointRule = (projectId, serviceId, endpointId, rule) => {
  const state = store.getState()
  const endpointConfig = getRemoteServiceEndpointConfig(state, serviceId, endpointId)
  const newEndpointConfig = Object.assign({}, endpointConfig, { rule })
  return saveRemoteServiceEndpoint(projectId, serviceId, endpointId, newEndpointConfig)
}

export const deleteRemoteServiceEndpoint = (projectId, serviceId, endpointId) => {
  const state = store.getState()
  const newEndpoints = getRemoteServiceEndpoints(state, serviceId)
  delete newEndpoints[endpointId]
  const serviceConfig = getRemoteServiceConfig(state, serviceId)
  const newServiceConfig = Object.assign({}, serviceConfig, { endpoints: newEndpoints })
  return saveRemoteService(projectId, serviceId, newServiceConfig)
}

// Getters
export const getRemoteServices = (state) => get(state, "remoteServices", {})
export const getRemoteServiceConfig = (state, serviceId) => get(state, `remoteServices.${serviceId}`, {})
export const getRemoteServiceURL = (state, serviceId) => get(state, `remoteServices.${serviceId}.url`, "")
export const getRemoteEndpointSecurityRule = (state, serviceId, endpointId) => get(state, `remoteServices.${serviceId}.endpoints.${endpointId}.rule`, {})
export const getRemoteServiceEndpoints = (state, serviceId) => get(state, `remoteServices.${serviceId}.endpoints`, {})
export const getRemoteServiceEndpointConfig = (state, serviceId, endpointId) => get(state, `remoteServices.${serviceId}.endpoints.${endpointId}`, {})
export const setRemoteEndpointRule = (serviceId, endpointId, rule) => store.dispatch(set(`remoteServices.${serviceId}.endpoints.${endpointId}.rule`, rule))
const setRemoteServices = (remoteServices) => store.dispatch(set("remoteServices", remoteServices))