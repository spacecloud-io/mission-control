import store from "../store"
import { increment, decrement } from "automate-redux"

class Database {
  constructor(client) {
    this.client = client
  }

  getConnectionState(projectId, dbName) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/external/projects/${projectId}/database/${dbName}/connection-state`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setDbConfig(projectId, dbName, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/config/database-config`, config)
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

  removeDbConfig(projectId, dbName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/database/${dbName}/config/database-config`)
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

  listCollections(projectId, dbName) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/external/projects/${projectId}/database/${dbName}/list-collections`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  modifySchema(projectId, dbName, collections) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/schema/mutate`, { collections })
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

  reloadSchema(projectId, dbName) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/schema/inspect`, {})
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  modifyColSchema(projectId, dbName, colName, schema) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/schema/mutate`, { schema })
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

  inspectColSchema(projectId, dbName, colName) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/schema/inspect`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  deleteCol(projectId, dbName, colName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}`)
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

  setColRule(projectId, dbName, colName, rule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/rules`, {
        isRealtimeEnabled: typeof rule.isRealtimeEnabled === "string" ? false : rule.isRealtimeEnabled, ...rule
      })
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

  setPreparedQueries(projectId, dbName, id, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/prepared-queries/${id}`, config)
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

  deletePreparedQueries(projectId, dbName, id) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/database/${dbName}/prepared-queries/${id}`)
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

  untrackCollection(projectId, dbName, colName) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/schema/inspect`)
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

export default Database