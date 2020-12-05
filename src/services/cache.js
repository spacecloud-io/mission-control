class Cache {
  constructor(client) {
    this.client = client
  }

  setCacheConfig(config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/caching/config/cache-config`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  getCacheConfig() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/caching/config`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  getCacheConnStatus() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/external/caching/connection-state`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  purgeCache(projectId, data) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/external/projects/${projectId}/caching/purge-cache`, data)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }
}

export default Cache