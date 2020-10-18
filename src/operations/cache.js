import { set } from "automate-redux";
import { get } from "dot-prop-immutable";
import client from "../client";
import store from "../store";
import { configResourceTypes, permissionVerbs } from "../constants";
import { checkResourcePermissions } from "../utils";

export const saveCacheConfig = (projectId, config) => {
  return new Promise((resolve, reject) => {
    client.cache.setCacheConfig(projectId, config)
      .then(({ queued }) => {
          if (!queued) {      
            store.dispatch(setCacheConfig(config))
            loadCacheConnState(projectId)
            .catch(ex => reject(ex))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const loadCacheConfig = (projectId) => {
    return new Promise((resolve, reject) => {
        const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.CACHE_CONFIG], permissionVerbs.READ)
        if (!hasPermission) {
          console.warn("No permission to fetch db config")
          setCacheConfig({})
          resolve()
          return
        }

        client.cache.getCacheConfig(projectId)
        .then(result => {
            store.dispatch(setCacheConfig(result[0]))
            resolve()
        })
        .catch(ex => reject(ex))
    })
}

export const loadCacheConnState = (projectId) => {
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

// Getters
export const getCacheConfig = (state) => get(state, "cacheConfig", {})
export const getCacheConnState = (state) => get(state, "cacheConnState", false)

// Setters
const setCacheConfig = (config) => set("cacheConfig", config)
const setCacheConnState = (connected) => set("cacheConnState", connected)