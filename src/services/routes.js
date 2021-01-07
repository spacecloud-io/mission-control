class Routes {
  constructor(client) {
    this.client = client
  }

  fetchIngressRoutes(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/routing/ingress`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result: [])
        })
        .catch(ex => reject({title: "Failed to get ingress-route", msg: ex.message}))
    })
  }

  fetchIngressRoutesGlobalConfig(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/routing/ingress/global`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }

          const ingressGlobalConfig = data.result && data.result[0] ? data.result[0]: {}
          resolve(ingressGlobalConfig)
        })
        .catch(ex => reject({title: "Failed to get ingress-global", msg: ex.message}))
    })
  }

  setRoutingConfig(projectId, routeId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/routing/ingress/${routeId}`, { ...config })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set ingress-route", msg: ex.message}))
    })
  }

  setRoutingGlobalConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/routing/ingress/global`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set ingress-global", msg: ex.message}))
    })
  }

  deleteRoutingConfig(projectId, routeId) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/routing/ingress/${routeId}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete ingress-route", msg: ex.message}))
    })
  }
}

export default Routes;