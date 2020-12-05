import { set } from "automate-redux";
import { get } from "dot-prop-immutable";
import client from "../client";
import store from "../store";

export const saveCacheConfig = (config) => {
	return new Promise((resolve, reject) => {
		client.cache.setCacheConfig(config)
			.then(({ queued }) => {
				if (!queued) {
					store.dispatch(setCacheConfig(config))
					if (config.enabled) {
						loadCacheConnState()
							.catch(ex => reject(ex))
					}
				}
				resolve({ queued })
			})
			.catch(ex => reject(ex))
	})
}

export const loadCacheConfig = () => {
	return new Promise((resolve, reject) => {
		client.cache.getCacheConfig()
			.then(result => {
				let cacheConfig = result[0]
				if (!cacheConfig) cacheConfig = {}
				store.dispatch(setCacheConfig(cacheConfig))
				resolve()
			})
			.catch(ex => reject(ex))
	})
}

export const loadCacheConnState = () => {
	return new Promise((resolve, reject) => {
		client.cache.getCacheConnStatus()
			.then(result => {
				store.dispatch(setCacheConnState(result))
				resolve()
			})
			.catch(ex => reject(ex))
	})
}

export const purgeCache = (projectId) => {
	return new Promise((resolve, reject) => {
		const purgeOptions = {
			resource: "*",
			dbAlias: "*",
			id: "*"
		}

		client.cache.purgeCache(projectId, purgeOptions)
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