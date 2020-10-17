import { set } from "automate-redux";
import client from "../client";
import store from "../store";

export const saveAddonConfig = (type, config) => {
  return new Promise((resolve, reject) => {
    client.addons.setAddonConfig(type, config)
      .then(() => {
        store.dispatch(setAddonsConfig(type, config))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadAddonConfig = (type) => {
  return new Promise((resolve, reject) => {
    client.addons.getAddonConfig(type)
    .then(result => {
      store.dispatch(setAddonsConfig(type, result[0]))
      getAddonConnState(type)
      resolve()
    })
    .catch(ex => reject(ex))
  })
}

export const getAddonConnState = (type) => {
    return new Promise((resolve, reject) => {
        client.addons.getAddonConnStatus(type)
        .then(result => {
            store.dispatch(setAddonConnState(type, result))
            resolve()
        })
        .catch(ex => reject(ex))
    })
}

// Setters
const setAddonsConfig = (type, config) => set(`addonsConfig.${type}`, config)
const setAddonConnState = (type, connected) => set(`addonsConnState.${type}`, connected)