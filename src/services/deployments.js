import { spaceCloudClusterOrigin } from "../constants"

class Deployments {
  constructor(client) {
    this.client = client
  }

  setDeploymentConfig(projectId, serviceId, version, serviceConfig) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/runner/${projectId}/services/${serviceId}/${version}`, serviceConfig)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  deleteDeploymentConfig(projectId, serviceId, version) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/runner/${projectId}/services/${serviceId}/${version}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  fetchDeployments(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/runner/${projectId}/services`)
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

  fetchDeploymentRoutes(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/runner/${projectId}/service-routes`)
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

  fetchDeploymentStatus(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/runner/${projectId}/services/status`)
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

  setDeploymentRoutes(projectId, serviceId, routes) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/runner/${projectId}/service-routes/${serviceId}`, { routes: routes })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject(ex.toString()))
    })
  }
}

export default Deployments