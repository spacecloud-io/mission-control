import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray } from "../utils";

export const loadSecurityFunctions = (projectId) => {
  return new Promise((resolve, reject) => {
    client.securityFunctions.fetchSecurityFunctions(projectId)
      .then(functions => {
        setSecurityFunctions(functions)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveSecurityFunction = (projectId, newConfig) => {
  return new Promise((resolve, reject) => {
    client.securityFunctions.setFunctionConfig(projectId, newConfig)
      .then(({ queued }) => {
        if (!queued) {
          const securityFunctions = getSecurityFunctions(store.getState())
          const oldConfig = getSecurityFunction(store.getState(), newConfig.id);
          const newSecurityFunctions = upsertArray(securityFunctions, obj => obj.id === newConfig.id, () => ({...oldConfig, ...newConfig}))
          setSecurityFunctions(newSecurityFunctions)
        }
        resolve({ queued })
      })
      .catch(error => reject(error))
  })
}

export const saveSecurityFunctionRule = (projectId, functionId, rule) => {
  return new Promise((resolve, reject) => {
    const oldConfig = getSecurityFunction(store.getState(), functionId)
    const newConfig = Object.assign({}, oldConfig, {}, { rule })
    client.securityFunctions.setFunctionConfig(projectId, newConfig)
      .then(({ queued }) => {
        if (!queued) {
          setSecurityFunctionRule(functionId, rule)
        }
        resolve({ queued })
      })
      .catch(error => reject(error))
  })
}

export const deleteSecurityFunction = (projectId, functionId) => {
  return new Promise((resolve, reject) => {
    client.securityFunctions.deleteFunctionConfig(projectId, functionId)
      .then(({ queued }) => {
        if (!queued) {
          const newSecurityFunctions = getSecurityFunctions(store.getState()).filter(item => item.id !== functionId)
          setSecurityFunctions(newSecurityFunctions)
        }
        resolve({ queued })
      })
      .catch(error => reject(error))
  })
}

export const getSecurityFunctions = (state) => get(state, "securityFunctions", [])
export const getSecurityFunctionRule = (state, id) => {
  const securityFunctions = getSecurityFunctions(state)
  const index = securityFunctions.findIndex(obj => obj.id === id)
  return get(securityFunctions[index], "rule", {})
}
export const getSecurityFunction = (state, functionId) => {
  const securityFunctions = getSecurityFunctions(state)
  const index = securityFunctions.findIndex(obj => obj.id === functionId)
  return (index === -1) ? {} : securityFunctions[index]
}
export const setSecurityFunctionRule = (functionId, rule) => {
  const securityFunctions = getSecurityFunctions(store.getState())
  const newSecurityFunctions = securityFunctions.map(obj => obj.id === functionId ? Object.assign({}, obj, { rule }) : obj)
  setSecurityFunctions(newSecurityFunctions)
}
const setSecurityFunctions = (functions) => store.dispatch(set("securityFunctions", functions))