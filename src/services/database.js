import store from "../store"
import { increment, decrement } from "automate-redux"

class Database {
  constructor(client) {
    this.client = client
  }

  // fetches config of all databases of a project
  fetchDbConfig(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/database/config`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get db-config", msg: ex.message}))
    })
  }

  // fetches schemas of all databases of a project
  fetchDbSchemas(projectId, dbAliasName, colName) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/database/collections/schema/mutate?dbAlias=${dbAliasName}&col=${colName}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get db-schema", msg: ex.message}))
    })
  }

  // fetches rules of all databases of a project
  fetchDbRules(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/database/collections/rules`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get db-rule", msg: ex.message}))
    })
  }

  // fetches prepared queries of all databases of a project
  fetchDbPreparedueries(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/database/prepared-queries`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get db-prepared-query", msg: ex.message}))
    })
  }

  getConnectionState(projectId, dbName) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/external/projects/${projectId}/database/${dbName}/connection-state`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject({title: "Failed to get database connection state", msg: ex.message}))
    })
  }

  setDbConfig(projectId, dbName, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/config/database-config`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set db-config", msg: ex.message}))
    })
  }

  removeDbConfig(projectId, dbName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/database/${dbName}/config/database-config`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete db-config", msg: ex.message}))
    })
  }

  listCollections(projectId, dbName) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/external/projects/${projectId}/database/${dbName}/list-collections`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get database collection/table", msg: ex.message}))
    })
  }

  modifySchema(projectId, dbName, collections) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/schema/mutate`, { collections })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set db-schema", msg: ex.message}))
    })
  }

  reloadSchema(projectId, dbName) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/schema/inspect`, {})
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set db-schema", msg: ex.message}))
    })
  }

  modifyColSchema(projectId, dbName, colName, schema) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/schema/mutate`, { schema })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set db-schema", msg: ex.message}))
    })
  }

  inspectColSchema(projectId, dbName, colName) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/schema/track`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set db-schema", msg: ex.message}))
    })
  }

  deleteCol(projectId, dbName, colName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete database collection", msg: ex.message}))
    })
  }

  setColRule(projectId, dbName, colName, rule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/rules`, {
        isRealtimeEnabled: typeof rule.isRealtimeEnabled === "string" ? false : rule.isRealtimeEnabled, ...rule
      })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set db-rule", msg: ex.message}))
    })
  }

  setPreparedQuery(projectId, dbName, id, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/prepared-queries/${id}`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set db-prepared-query", msg: ex.message}))
    })
  }

  deletePreparedQuery(projectId, dbName, id) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/database/${dbName}/prepared-queries/${id}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete db-prepared-query", msg: ex.message}))
    })
  }

  untrackCollection(projectId, dbName, colName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/schema/untrack`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to untrack database collection", msg: ex.message}))
    })
  }
}

export default Database