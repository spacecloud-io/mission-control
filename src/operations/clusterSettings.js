import { set, del, get } from "automate-redux";
import client from "../client";
import store from "../store";

export const loadClusterSettings = () => {
  return new Promise((resolve, reject) => {
    client.clusterConfig.getConfig()
      .then(clusterConfig => {
        store.dispatch(set("clusterConfig", clusterConfig))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setClusterSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    const { credentials, ...config } = get(store.getState(), "clusterConfig", {})
    const newConfig = Object.assign({}, config, { [key]: value })
    client.clusterConfig.setConfig(newConfig)
      .then(() => {
        store.dispatch(set("clusterConfig", newConfig))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}