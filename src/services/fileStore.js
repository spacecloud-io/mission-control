class FileStore {
  constructor(client) {
    this.client = client
  }

  getConnectionState(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/external/projects/${projectId}/file-storage/connection-state`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject({title: "Failed to get filestore connection state", msg: ex.message}))
    })
  }

  getConfig(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/file-storage/config`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }

          const fileStoreConfig = data.result && data.result[0] ? data.result[0] : {}
          resolve(fileStoreConfig)
        })
        .catch(ex => reject({title: "Failed to get filestore-config", msg: ex.message}))
    })
  }

  getRules(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/file-storage/rules`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get filestore-rule", msg: ex.message}))
    })
  }

  setConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/file-storage/config/file-storage-config`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set filestore-config", msg: ex.message}))
    })
  }

  setRule(projectId, ruleName, rule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/file-storage/rules/${ruleName}`, { id: ruleName, ...rule })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set filestore-rule", msg: ex.message}))
    })
  }

  deleteRule(projectId, ruleName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/file-storage/rules/${ruleName}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete filestore-rule", msg: ex.message}))
    })
  }
}

export default FileStore