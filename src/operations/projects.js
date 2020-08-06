import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { generateProjectConfig } from "../utils";

export const loadProjects = () => {
  return new Promise((resolve, reject) => {
    client.projects.getProjects()
      .then(projects => {
        store.dispatch(set("projects", projects))
        resolve(projects)
      })
      .catch(ex => reject(ex))
  })
}

export const addProject = (projectId, projectName) => {
  return new Promise((resolve, reject) => {
    const projectConfig = generateProjectConfig(projectId, projectName)
    client.projects.setProjectConfig(projectId, projectConfig)
      .then(({ queued }) => {
        if (!queued) {
          const newProjects = [...store.getState().projects, projectConfig]
          store.dispatch(set("projects", newProjects))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteProject = (projectId) => {
  return new Promise((resolve, reject) => {
    client.projects.deleteProject(projectId)
      .then(({ queued }) => {
        const projects = store.getState().projects
        const newProjects = projects.filter(obj => obj.id !== projectId)
        if (!queued) {
          store.dispatch(set("projects", newProjects))
        }
        resolve({ queued, newProjects })
      })
      .catch(ex => reject(ex))
  })
}

const saveProjectSetting = (projectId, key, value) => {
  return new Promise((resolve, reject) => {
    const projects = store.getState().projects
    const oldProjectConfig = projects.find(obj => obj.id === projectId)
    const newProjectConfig = Object.assign({}, oldProjectConfig, { [key]: value })
    const newProjects = projects.map(obj => obj.id === projectId ? newProjectConfig : obj)
    client.projects.setProjectConfig(projectId, newProjectConfig)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set("projects", newProjects))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveContextTimeGraphQL = (projectId, contextTimeGraphQL) => saveProjectSetting(projectId, "contextTimeGraphQL", contextTimeGraphQL)

export const saveDockerRegistry = (projectId, dockerRegistry) => saveProjectSetting(projectId, "dockerRegistry", dockerRegistry)

export const saveAesKey = (projectId, aesKey) => saveProjectSetting(projectId, "aesKey", aesKey)

export const addSecret = (projectId, secret, isPrimary) => {
  const secrets = store.getState().projects.find(obj => obj.id === projectId).secrets
  const oldSecrets = isPrimary ? secrets.map(obj => Object.assign({}, obj, { isPrimary: false })) : secrets
  const newSecret = { secret, isPrimary }
  const newSecrets = [...oldSecrets, newSecret]
  return saveProjectSetting(projectId, "secrets", newSecrets)
}

export const changePrimarySecret = (projectId, secret) => {
  const secrets = store.getState().projects.find(obj => obj.id === projectId).secrets
  const newSecrets = secrets.map(obj => Object.assign({}, obj, { isPrimary: obj.secret === secret ? true : false }))
  return saveProjectSetting(projectId, "secrets", newSecrets)
}

export const removeSecret = (projectId, secret) => {
  const secrets = store.getState().projects.find(obj => obj.id === projectId).secrets
  const newSecrets = secrets.filter((obj) => obj.secret !== secret)
  const primarySecretPresent = newSecrets.some(obj => obj.isPrimary)
  if (!primarySecretPresent && newSecrets.length > 0) newSecrets[0].isPrimary = true
  return saveProjectSetting(projectId, "secrets", newSecrets)
}

// Getters

export function getProjectConfig(state, projectId) {
  const projects = get(state, "projects", [])
  const index = projects.findIndex(obj => obj.id === projectId)
  return index === -1 ? {} : projects[index]
}

export function getJWTSecret(state, projectId) {
  const projectConfig = getProjectConfig(state, projectId)
  const secrets = get(projectConfig, "secrets", [])
  if (secrets.length === 0) return ""
  return secrets[0].secret
}