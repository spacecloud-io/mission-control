import { set } from "automate-redux";
import { get } from "dot-prop-immutable";
import client from "../client";
import store from "../store";

export const saveAddonConfig = (type, config) => {
  return new Promise((resolve, reject) => {
    client.addons.setAddonConfig(type, config)
      .then(() => {
        store.dispatch(setAddOnConfig(type, config))
        if (config.enabled) {
          loadAddonConnState(type)
            .catch(error => reject(error))
        }
        resolve()
      })
      .catch(error => reject(error))
  })
}

export const loadAddonConfig = (type) => {
  return new Promise((resolve, reject) => {
    client.addons.getAddonConfig(type)
      .then(result => {
        store.dispatch(setAddOnConfig(type, result[0]))
        resolve()
      })
      .catch(error => reject(error))
  })
}

export const loadAddonConnState = (type) => {
  return new Promise((resolve, reject) => {
    client.addons.getAddonConnStatus(type)
      .then(result => {
        store.dispatch(setAddonConnState(type, result))
        resolve()
      })
      .catch(error => reject(error))
  })
}

//Getters
export const getAddonsConfig = (state) => get(state, "addonsConfig", {})
export const getAddonConnState = (state) => get(state, "addonsConnState", {})

// Setters
const setAddOnConfig = (type, config) => set(`addonsConfig.${type}`, config)
const setAddonConnState = (type, connected) => set(`addonsConnState.${type}`, connected)