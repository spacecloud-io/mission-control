class Projects {
  constructor(client) {
    this.client = client
  }

  getProjects() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects`)
        .then(({status, data}) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.projects)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  addProject(config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/config/projects", config)
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

  deleteProject(projectId) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}`)
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

  setProjectGlobalConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/config`, config)
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

export default Projects