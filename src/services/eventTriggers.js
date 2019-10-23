class EventTriggers {
  constructor(client) {
    this.client = client
  }

  setEventingConfig(projectId, config) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/event-triggers/config`, config)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  queueEvent(projectId, event) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/event-triggers/queue`, event)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  setTriggerRule(projectId, triggerName, triggerRule) {
    return Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/event-triggers/rules/${triggerName}`, triggerRule)
        .then((status, data) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
    })
  }

  deleteTriggerRule(projectId, triggerName) {
    return Promise((resolve, reject) => {
      this.client.delete(`/v1/config/${projectId}/event-triggers/rules/${triggerName}`)
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

export default EventTriggers