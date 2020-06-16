class Deployments {
  constructor(client) {
    this.client = client
  }

  setDeploymentConfig(projectId, serviceId, version, serviceConfig) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/runner/${projectId}/services/${serviceId}/${version}`, serviceConfig)
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

  deleteDeploymentConfig(projectId, serviceId, version) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/runner/${projectId}/services/${serviceId}/${version}`)
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

  fetchDeploymentRoutes(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/runner/${projectId}/service-routes`)
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

  fetchDeploymentStatus(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/runner/${projectId}/services/status`)
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

  async fetchDeploymentLogs(projectId, id, task, replica, callback) {
    const response = await fetch(`http://192.168.99.100:4122/v1/runner/${projectId}/services/logs/${id}/${task}/${replica}`)
    const body = response.body
    const decoder = new TextDecoder('utf-8')
    const writableStream = new WritableStream({
      write(chunk) {
        callback(decoder.decode(chunk))
      },
      close() {
        console.log('closed!!!')
      }
    });

    body.pipeTo(writableStream)
  }

  setDeploymentRoutes(projectId, serviceId, routes) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/runner/${projectId}/service-routes/${serviceId}`, { routes: routes })
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

export default Deployments