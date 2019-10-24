class FileStorage {
  constructor(client) {
    this.client = client
  }

  getConnectionState(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/${projectId}/file-storage/connection-state`)
        .then(({status, data}) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setEventingConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/file-storage/config`, config)
        .then(({status, data}) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setTriggerRule(projectId, ruleName, rule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/file-storage/rules/${ruleName}`, rule)
        .then(({status, data}) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  deleteTriggerRule(projectId, ruleName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/${projectId}/file-storage/rules/${ruleName}`)
        .then(({status, data}) => {
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

export default FileStorage