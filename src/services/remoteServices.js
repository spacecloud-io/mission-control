class RemoteServices {
  constructor(client) {
    this.client = client
  }

  setServiceConfig(projectId, serviceName, config) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/services/${serviceName}`, config)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  deleteServiceConfig(projectId, serviceName) {
    return Promise((resolve, reject) => {
      this.client.delete(`/v1/config/${projectId}/services/${serviceName}`)
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

export default RemoteServices