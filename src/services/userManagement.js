class UserManagement {
  constructor(client) {
    this.client = client
  }

  fetchUserManConfig(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/user-management/provider`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get auth-provider", msg: ex.message}))
    })
  }
  setUserManConfig(projectId, provider, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/user-management/provider/${provider}`, { id: provider, ...config })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set auth-provider", msg: ex.message}))
    })
  }
}

export default UserManagement