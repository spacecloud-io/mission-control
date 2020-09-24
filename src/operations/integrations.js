import client from "../client";
import store from "../store";
import { set, get } from "automate-redux";
import dotProp from "dot-prop-immutable";
import { configResourceTypeLabels, apiResourceTypeLabels } from "../constants";

export function loadSupportedIntegrations() {
  return new Promise((resolve, reject) => {
    client.integrations.fetchSupportedIntegrations()
      .then((integraions) => {
        setSupportedIntegrations(integraions)
        resolve()
      })
      .catch((ex) => reject(ex))
  })
}

export function loadInstalledIntegrations() {
  return new Promise((resolve, reject) => {
    client.integrations.fetchInstalledIntegrations()
      .then((installedIntegrations) => {
        setInstalledIntegrations(installedIntegrations)
        resolve()
      })
      .catch((ex) => reject(ex))
  })
}

export function installIntegration(integrationId, useUploadedIntegration) {
  return new Promise((resolve, reject) => {
    const state = store.getState()
    const integrationConfig = getIntegrationConfig(state, integrationId, useUploadedIntegration)
    client.integrations.installIntegration(integrationConfig)
      .then(({ queued }) => {
        if (!queued) {
          const installedIntegrations = getInstalledIntegrations(state)
          const newInstalledIntegrations = [...installedIntegrations, integrationConfig]
          setInstalledIntegrations(newInstalledIntegrations)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export function deleteIntegration(integrationId) {
  return new Promise((resolve, reject) => {
    client.integrations.removeIntegration(integrationId)
      .then(({ queued }) => {
        if (!queued) {
          const state = store.getState()
          const installedIntegrations = getInstalledIntegrations(state)
          const newInstalledIntegrations = installedIntegrations.filter(obj => obj.id !== integrationId)
          setInstalledIntegrations(newInstalledIntegrations)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}


export function getIntegrationConfigPermissions(state, integrationId, useUploadedIntegration) {
  const { configPermissions = [] } = getIntegrationDetails(state, integrationId, useUploadedIntegration)
  const adjustedConfigPermissions = configPermissions.map(({ resources = [], verbs = [] }) => {
    if (resources.length === 1 && resources[0] === "*") {
      resources = Object.keys(configResourceTypeLabels)
    }
    if (verbs.length === 1 && verbs[0] === "*") {
      verbs = ["read", "modify", "hook", "hijack"]
    }
    return { resources, verbs }
  })

  let permissionsMap = {}
  adjustedConfigPermissions.forEach(({ resources = [], verbs }) => {
    resources.forEach((resource) => {
      verbs.forEach((verb) => {
        permissionsMap = dotProp.set(permissionsMap, `${resource}.${verb}`, true)
      })
    })
  })
  return Object.entries(permissionsMap).map(([key, value]) => Object.assign({}, value, { resource: key }))
}

export function getIntegrationAPIPermissions(state, integrationId, useUploadedIntegration) {
  const { apiPermissions = [] } = getIntegrationDetails(state, integrationId, useUploadedIntegration)
  const adjustedApiPermissions = apiPermissions.map(({ resources = [], verbs = [] }) => {
    if (resources.length === 1 && resources[0] === "*") {
      resources = Object.keys(apiResourceTypeLabels)
    }
    if (verbs.length === 1 && verbs[0] === "*") {
      verbs = ["access", "hook", "hijack"]
    }
    return { resources, verbs }
  })

  let permissionsMap = {}
  adjustedApiPermissions.forEach(({ resources = [], verbs }) => {
    resources.forEach((resource) => {
      verbs.forEach((verb) => {
        permissionsMap = dotProp.set(permissionsMap, `${resource}.${verb}`, true)
      })
    })
  })
  return Object.entries(permissionsMap).map(([key, value]) => Object.assign({}, value, { resource: key }))
}

// Getters and setters
function setSupportedIntegrations(integrations) {
  store.dispatch(set("integrations", integrations))
}

function getSupportedIntegrations(state) {
  return get(state, "integrations", [])
}

function setInstalledIntegrations(installedIntegrations) {
  store.dispatch(set("installedIntegrations", installedIntegrations))
}

export function getInstalledIntegrations(state) {
  return get(state, "installedIntegrations", [])
}

export function getIntegrations(state) {
  const supportedIntegrations = getSupportedIntegrations(state)
  const installedIntegrations = getInstalledIntegrations(state)
  const supportedIntegrationsMap = supportedIntegrations.reduce((prev, curr) => {
    return Object.assign({}, prev, { [curr.id]: Object.assign({}, curr, { installed: false }) })
  }, {})
  const installedIntegrationsMap = installedIntegrations.reduce((prev, curr) => {
    return Object.assign({}, prev, { [curr.id]: Object.assign({}, curr, { installed: true }) })
  }, {})
  const integrationIds = [...new Set([...Object.keys(supportedIntegrationsMap), ...Object.keys(installedIntegrationsMap)])]
  return integrationIds.map(id => installedIntegrationsMap[id] ? installedIntegrationsMap[id] : supportedIntegrationsMap[id])
}

export function getIntegrationDetails(state, integrationId, useUploadedIntegration) {
  if (useUploadedIntegration) {
    return state.uploadedIntegration ? state.uploadedIntegration : {}
  }
  const integrations = getIntegrations(state)
  const index = integrations.findIndex(obj => obj.id === integrationId)
  return index === -1 ? {} : integrations[index]
}

export function getIntegrationConfig(state, integrationId, useUploadedIntegration) {
  if (useUploadedIntegration) {
    return state.uploadedIntegration ? state.uploadedIntegration : {}
  }
  const integrations = getSupportedIntegrations(state)
  const index = integrations.findIndex(obj => obj.id === integrationId)
  return index === -1 ? {} : integrations[index]
}