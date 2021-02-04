class SecurityFunctions {
  constructor(client) {
    this.client = client
  }

  fetchSecurityFunctions(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/security/function`)
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

  setFunctionConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/security/function/${config.id}`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set security function", msg: ex.message}))
    })
  }

  deleteFunctionConfig(projectId, functionId) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/security/function/${functionId}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete security-function", msg: ex.message}))
    })
  }
}

export default SecurityFunctions;