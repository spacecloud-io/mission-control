class FileStorage {
  constructor(client) {
    this.client = client
  }

  getConnectionState(projectId) {
    return Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/${projectId}/file-storage/connection-state`)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  setEventingConfig(projectId, config) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/file-storage/config`, config)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  setTriggerRule(projectId, ruleName, rule) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/file-storage/rules/${ruleName}`, rule)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  deleteTriggerRule(projectId, ruleName) {
    return Promise((resolve, reject) => {
      this.client.delete(`/v1/config/${projectId}/file-storage/rules/${ruleName}`)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }
}

export default FileStorage