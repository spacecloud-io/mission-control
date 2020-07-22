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
        const installedIntegrationsMap = installedIntegrations.reduce((prev, curr) => {
          return Object.assign({}, prev, { [curr.id]: true })
        }, {})
        setInstalledIntegrations(installedIntegrationsMap)
        resolve()
      })
      .catch((ex) => reject(ex))
  })
}

export function installIntegration(integrationId) {
  return new Promise((resolve, reject) => {
    const state = store.getState()
    const integrationConfig = getIntegrationConfig(state, integrationId)
    client.integrations.installIntegration(integrationConfig)
      .then(() => {
        const installedIntegrations = getInstalledIntegrations(state)
        const newInstalledIntegrations = Object.assign({}, installedIntegrations, { [integrationConfig.id]: true })
        setInstalledIntegrations(newInstalledIntegrations)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}
export function deleteIntegration(integrationId) {
  return new Promise((resolve, reject) => {
    client.integrations.removeIntegration(integrationId)
      .then(() => {
        const state = store.getState()
        const installedIntegrations = getInstalledIntegrations(state)
        const newInstalledIntegrations = Object.assign({}, installedIntegrations, { [integrationId]: false })
        setInstalledIntegrations(newInstalledIntegrations)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}


export function getIntegrationConfigPermissions(state, integrationId) {
  const { configPermissions = [] } = getIntegrationDetails(state, integrationId)
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

export function getIntegrationAPIPermissions(state, integrationId) {
  const { apiPermissions = [] } = getIntegrationDetails(state, integrationId)
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

function getInstalledIntegrations(state) {
  return get(state, "installedIntegrations", {})
}

export function getIntegrations(state) {
  const supportedIntegrations = getSupportedIntegrations(state)
  const installedIntegrations = getInstalledIntegrations(state)
  return supportedIntegrations.map((obj) => {
    return Object.assign({}, obj, {
      installed: installedIntegrations[obj.id] ? true : false
    })
  })
}

export function getIntegrationDetails(state, integrationId) {
  const integrations = getIntegrations(state)
  const index = integrations.findIndex(obj => obj.id === integrationId)
  return index === -1 ? {} : integrations[index]
}

export function getIntegrationConfig(state, integrationId) {
  const integrations = getSupportedIntegrations(state)
  const index = integrations.findIndex(obj => obj.id === integrationId)
  return index === -1 ? {} : integrations[index]
}