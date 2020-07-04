import { set, del } from "automate-redux";
import client from "../client";
import store from "../store";

export const loadLetsEncryptConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    client.letsencrypt.fetchConfig(projectId)
      .then(letsencryptConfig => {
        store.dispatch(set("letsencrypt", letsencryptConfig))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setWhiteListedDomains = (projectId, domains) => {
  return new Promise((resolve, reject) => {
    client.letsencrypt.setConfig(projectId, { domains: domains })
      .then(() => {
        store.dispatch(set(`letsencrypt.domains`, domains))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}