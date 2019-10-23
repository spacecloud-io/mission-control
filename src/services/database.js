class Database {
  constructor(client) {
    this.client = client
  }

  getConnectionState(projectId, dbName) {
    return Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/${projectId}/database/${dbName}/connection-state`)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  setDbConfig(projectId, dbName, config) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/database/${dbName}/config`, config)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  listCollections(projectId, dbName) {
    return Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/${projectId}/database/${dbName}/list-collections`)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.collections)
        })
    })
  }

  modifySchema(projectId, dbName, collections) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/database/${dbName}/modify-schema`, { collections })
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  reloadSchema(projectId, dbName) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/database/${dbName}/reload-schema`, {})
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.collections)
        })
    })
  }

  modifyColSchema(projectId, dbName, colName, schema) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/database/${dbName}/collections/${colName}/modify-schema`, { schema })
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  inspectColSchema(projectId, dbName, colName) {
    return Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/${projectId}/database/${dbName}/collections/${colName}/inspect-schema`)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.schema)
        })
    })
  }

  deleteCol(projectId, dbName, colName) {
    return Promise((resolve, reject) => {
      this.client.delete(`/v1/config/${projectId}/database/${dbName}/collections/${colName}`)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  setColRule(projectId, dbName, colName, rule) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/database/${dbName}/collections/${colName}/rules`, rule)
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

export default Database