import { set } from "automate-redux";
import client from "../client";
import store from "../store";

export const saveCacheConfig = (projectId, config) => {
  return new Promise((resolve, reject) => {
    client.cache.setCacheConfig(projectId, config)
      .then(() => {
        store.dispatch(setCacheConfig(config))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadCacheConfig = (projectId) => {
    return new Promise((resolve, reject) => {
        client.cache.getCacheConfig(projectId)
        .then(result => {
            store.dispatch(setCacheConfig(result[0]))
            getCacheConnState(projectId)
            resolve()
        })
        .catch(ex => reject(ex))
    })
}

export const getCacheConnState = (projectId) => {
    return new Promise((resolve, reject) => {
        client.cache.getCacheConnStatus(projectId)
        .then(result => {
            store.dispatch(setCacheConnState(result))
            resolve()
        })
        .catch(ex => reject(ex))
    })
}

export const purgeCache = (projectId, data) => {
    return new Promise((resolve, reject) => {
        client.cache.purgeCache(projectId, data)
        .then(() => resolve())
        .catch(ex => reject(ex))
    })
}

// Setters
const setCacheConfig = (config) => set("cacheConfig", config)
const setCacheConnState = (connected) => set("cacheConnState", connected)