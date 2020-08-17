class Secrets {
  constructor(client) {
    this.client = client
  }

  fetchSecrets(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/runner/${projectId}/secrets`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setSecret(projectId, secretConfig) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/runner/${projectId}/secrets/${secretConfig.id}`, secretConfig)
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

  setSecretKey(projectId, secretName, key, value) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/runner/${projectId}/secrets/${secretName}/${key}`, { value: value })
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

  deleteSecret(projectId, secretName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/runner/${projectId}/secrets/${secretName}`)
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

  deleteSecretKey(projectId, secretName, key) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/runner/${projectId}/secrets/${secretName}/${key}`)
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

  setRootPath(projectId, secretName, rootPath) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/runner/${projectId}/secrets/${secretName}/root-path`, { rootPath })
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
}

export default Secrets