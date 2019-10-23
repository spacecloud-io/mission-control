class Projects {
  constructor(client) {
    this.client = client
  }

  getProjects() {
    return Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config`)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.projects)
        })
    })
  }

  addProject(projectId, config) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}`, config)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  deleteProject(projectId) {
    return Promise((resolve, reject) => {
      this.client.delete(`/v1/config/${projectId}`)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  setProjectGlobalConfig(projectId, config) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/config`, config)
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

export default Projects