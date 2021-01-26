class Projects {
  constructor(client) {
    this.client = client
  }

  getProjects() {
    return new Promise((resolve, reject) => {
      this.client.getJSON("/v1/config/projects/*")
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get project", msg: ex.message}))
    })
  }

  fetchProjectAPIToken(projectId) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/generate-internal-token`, {})
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject({title: "Failed to get project API token", msg: ex.message}))
    })
  }

  setProjectConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set project", msg: ex.message}))
    })
  }

  deleteProject(projectId) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete project", msg: ex.message}))
    })
  }
}

export default Projects