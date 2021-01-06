import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";

export const loadLetsEncryptConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    client.letsencrypt.fetchConfig(projectId)
      .then(letsencryptConfig => {
        store.dispatch(set("letsencryptConfig", letsencryptConfig))
        resolve()
      })
      .catch(error => reject(error))
  })
}

export const saveWhiteListedDomains = (projectId, domains) => {
  return new Promise((resolve, reject) => {
    client.letsencrypt.setConfig(projectId, { domains: domains })
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`letsencryptConfig.domains`, domains))
        }
        resolve({ queued })
      })
      .catch(error => reject(error))
  })
}

export const getWhiteListedDomains = (state) => get(state, "letsencryptConfig.domains", [])