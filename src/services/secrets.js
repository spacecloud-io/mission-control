class Secrets {
  constructor(client) {
    this.client = client
  }

  addSecret(projectId, secretConfig) {
    return new Promise((resolve, reject) => {
      this.client.putJSON(`/v1/runner/${projectId}/secrets`, secretConfig)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setSecretKey(projectId, secretName, key, value) {
    return new Promise((resolve, reject) => {
      this.client.putJSON(`/v1/runner/${projectId}/secrets/${secretName}/${key}`, { value: value })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  deleteSecret(projectId, secretName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/runner/${projectId}/secrets/${secretName}`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  deleteSecretKey(projectId, secretName, key) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/runner/${projectId}/secrets/${secretName}/${key}`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setRootPath(projectId, secretName, rootpath) {
    return new Promise((resolve, reject) => {
      this.client.putJSON(`/v1/runner/${projectId}/secrets/${secretName}/rootPath`, rootpath)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }
}

export default Secrets