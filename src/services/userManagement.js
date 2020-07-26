class UserManagement {
  constructor(client) {
    this.client = client
  }

  fetchUserManConfig(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/user-management/provider`)
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
  setUserManConfig(projectId, provider, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/user-management/provider/${provider}`, { id: provider, ...config })
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

export default UserManagement