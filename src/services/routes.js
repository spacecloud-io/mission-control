class Routes {
  constructor(client) {
    this.client = client
  }

  setRoutingConfig(projectId, routeId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/routing/ingress/${routeId}`, { ...config })
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

  deleteRoutingConfig(projectId, routeId) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/routing/${routeId}`)
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

export default Routes;