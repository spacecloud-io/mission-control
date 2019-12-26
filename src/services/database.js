import store from "../store"
import { increment, decrement } from "automate-redux"
import client from "../client"

class Database {
  constructor(client) {
    this.client = client
  }

  getConnectionState(projectId, dbName) {
    
    const token = localStorage.getItem("token")
      if(token){
        client.setToken(token)
      }
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/database/${dbName}/connection-state`)
        .then(({ status, data }) => {
          console.log("get conn state", status, data)
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.status)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setDbConfig(projectId, dbName, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/config`, config)
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
      this.client.delete(`/v1/config/projects/${projectId}/database/${dbName}`)
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
      this.client.getJSON(`/v1/config/projects/${projectId}/database/${dbName}/list-collections`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.collections)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  modifySchema(projectId, dbName, collections) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/modify-schema`, { collections })
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
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/reload-schema`, {})
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.collections)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  modifyColSchema(projectId, dbName, colName, schema) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/modify-schema`, { schema })
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
      this.client.getJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/inspect-schema`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.schema)
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
      this.client.postJSON(`/v1/config/projects/${projectId}/database/${dbName}/collections/${colName}/rules`, rule)
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