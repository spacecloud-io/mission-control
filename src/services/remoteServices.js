class RemoteServices {
  constructor(client) {
    this.client = client
  }

  fetchServices(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/remote-service/service`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get remote-service", msg: ex.message}))
    })
  }

  setServiceConfig(projectId, serviceName, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/remote-service/service/${serviceName}`, { id: serviceName, ...config })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set remote-service", msg: ex.message}))
    })
  }

  deleteServiceConfig(projectId, serviceName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/remote-service/service/${serviceName}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete remote-service", msg: ex.message}))
    })
  }
}

export default RemoteServices