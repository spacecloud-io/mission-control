import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";

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

export const saveSecurityFunction = (projectId, config) => {
  return new Promise((resolve, reject) => {
    client.securityFunctions.setFunctionConfig(projectId, config)
      .then(({ queued }) => {
        if (!queued) {
          const newSecurityFunctions = getSecurityFunctions(store.getState()).concat(config)
          setSecurityFunctions(newSecurityFunctions)
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
const setSecurityFunctions = (functions) => store.dispatch(set("securityFunctions", functions))