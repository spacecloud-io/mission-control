class Cache {
  constructor(client) {
    this.client = client
  }

  setCacheConfig(config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/caching/config/cache-config`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set cache-config", msg: ex.message}))
    })
  }

  getCacheConfig() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/caching/config`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject({title: "Failed to get cache-config", msg: ex.message}))
    })
  }

  getCacheConnStatus() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/external/caching/connection-state`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject({title: "Failed to get cache connection status", msg: ex.message}))
    })
  }

  purgeCache(projectId, data) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/external/projects/${projectId}/caching/purge-cache`, data)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve()
        })
        .catch(ex => reject({title: "Failed to delete cache", msg: ex.message}))
    })
  }
}

export default Cache