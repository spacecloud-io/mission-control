import { set } from "automate-redux";
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
      .then(() => {
        const newProjects = [...store.getState().projects, projectConfig]
        store.dispatch(set("projects", newProjects))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteProject = (projectId) => {
  return new Promise((resolve, reject) => {
    client.projects.deleteProject(projectId)
      .then(() => {
        const projects = store.getState().projects
        const newProjects = projects.filter(obj => obj.id !== projectId)
        store.dispatch(set("projects", newProjects))
        resolve(newProjects)
      })
      .catch(ex => reject(ex))
  })
}

const setProjectSetting = (projectId, key, value) => {
  return new Promise((resolve, reject) => {
    const projects = store.getState().projects
    const oldProjectConfig = projects.find(obj => obj.id === projectId)
    const newProjectConfig = Object.assign({}, oldProjectConfig, { [key]: value })
    const newProjects = projects.map(obj => obj.id === projectId ? newProjectConfig : obj)
    client.projects.setProjectConfig(projectId, newProjectConfig)
      .then(() => {
        store.dispatch(set("projects", newProjects))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setContextTimeGraphQL = (projectId, contextTimeGraphQL) => setProjectSetting(projectId, "contextTimeGraphQL", contextTimeGraphQL)

export const setDockerRegistry = (projectId, dockerRegistry) => setProjectSetting(projectId, "dockerRegistry", dockerRegistry)

export const setAesKey = (projectId, aesKey) => setProjectSetting(projectId, "aesKey", aesKey)

export const addSecret = (projectId, secret, isPrimary) => {
  const secrets = store.getState().projects.find(obj => obj.id === projectId).secrets
  const oldSecrets = isPrimary ? secrets.map(obj => Object.assign({}, obj, { isPrimary: false })) : secrets
  const newSecret = { secret, isPrimary }
  const newSecrets = [...oldSecrets, newSecret]
  return setProjectSetting(projectId, "secrets", newSecrets)
}

export const changePrimarySecret = (projectId, secret) => {
  const secrets = store.getState().projects.find(obj => obj.id === projectId).secrets
  const newSecrets = secrets.map(obj => Object.assign({}, obj, { isPrimary: obj.secret === secret ? true : false }))
  return setProjectSetting(projectId, "secrets", newSecrets)
}

export const removeSecret = (projectId, secret) => {
  const secrets = store.getState().projects.find(obj => obj.id === projectId).secrets
  const newSecrets = secrets.filter((obj) => obj.secret !== secret)
  const primarySecretPresent = newSecrets.some(obj => obj.isPrimary)
  if (!primarySecretPresent && newSecrets.length > 0) newSecrets[0].isPrimary = true
  return setProjectSetting(projectId, "secrets", newSecrets)
}