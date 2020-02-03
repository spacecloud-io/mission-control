class EventTriggers {
  constructor(client) {
    this.client = client
  }

  setEventingConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/event-triggers/config`, config)
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

  queueEvent(projectId, event) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/api/${projectId}/event-triggers/queue`, event)
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

  setTriggerRule(projectId, triggerName, triggerRule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/event-triggers/rules/${triggerName}`, triggerRule)
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

  deleteTriggerRule(projectId, triggerName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/event-triggers/rules/${triggerName}`)
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

  deleteSecurityRule(projectId, type) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/eventing/rules/${type}`)
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

  setSecurityRule(projectId, type, rule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/rules/${type}`, { rule: rule })
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

  setEventSchema(projectId, type, schema) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/schema/${type}`, { schema })
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

  deleteEventSchema(projectId, type) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/eventing/schema/${type}`)
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

export default EventTriggers