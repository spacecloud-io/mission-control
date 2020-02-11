class RemoteServices {
  constructor(client) {
    this.client = client
  }

  setServiceConfig(projectId, serviceName, config) {
    return new Promise((resolve, reject) => {
      this.client.putJSON(`/v1/config/projects/${projectId}/services/${serviceName}`, config)
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

  deleteServiceConfig(projectId, serviceName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/services/${serviceName}`)
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

export default RemoteServices