import { set, del, get } from "automate-redux";
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

export const saveRemoteService = (projectId, serviceId, config) => {
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
  const newEndpointConfig = Object.assign({}, config, { rule })
  const state = store.getState()
  const endpoints = getRemoteServiceEndpoints(state, serviceId)
  // Strip out the rule from the config 
  const { rule: _, ...config } = getRemoteServiceEndpointConfig(state, serviceId, endpointId)
  // New config should be old config + new rule
  const newEndpoints = Object.assign({}, endpoints, { [endpointId]: newEndpointConfig })
  const serviceConfig = getRemoteServiceConfig(state, serviceId)
  const newServiceConfig = Object.assign({}, serviceConfig, { endpoints: newEndpoints })
  return saveRemoteService(projectId, serviceId, newServiceConfig)
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
export const getRemoteEndpointSecurityRule = (state, serviceId, endpointId) => get(state, `remoteServices.${serviceId}.${endpointId}.rule`, {})
export const getRemoteServiceEndpoints = (state, serviceId) => get(state, `remoteServices.${serviceId}.endpoints`, {})
export const getRemoteServiceEndpointConfig = (state, serviceId, endpointId) => get(state, `remoteServices.${serviceId}.endpoints.${endpointId}`, {})
export const setRemoteEndpointRule = (serviceId, endpointId, rule) => store.dispatch(set(`remoteServices.${serviceId}.endpoints.${endpointId}.rule`, rule))