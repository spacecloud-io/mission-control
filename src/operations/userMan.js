import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { checkResourcePermissions } from "../utils";
import { configResourceTypes, permissionVerbs } from "../constants";

export const loadUserManConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.USER_MANAGEMENT], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch auth providers")
      setUserManConfig({})
      resolve()
      return
    }

    client.userManagement.fetchUserManConfig(projectId)
      .then((result = []) => {
        const userMan = result.reduce((prev, curr) => Object.assign({}, prev, { [curr.id]: curr }), {})
        setUserManConfig(userMan)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveUserManConfig = (projectId, providerId, config) => {
  return new Promise((resolve, reject) => {
    client.userManagement.setUserManConfig(projectId, providerId, config)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`userMan.${providerId}`, config))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

// getters

export const getEmailConfig = (state) => get(state, "userMan.email", {})
const setUserManConfig = (userManConfig) => store.dispatch(set("userMan", userManConfig))