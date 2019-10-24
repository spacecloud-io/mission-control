class EventTriggers {
  constructor(client) {
    this.client = client
  }

  setEventingConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/event-triggers/config`, config)
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

  queueEvent(projectId, event) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/event-triggers/queue`, event)
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

  setTriggerRule(projectId, triggerName, triggerRule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/${projectId}/event-triggers/rules/${triggerName}`, triggerRule)
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

  deleteTriggerRule(projectId, triggerName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/${projectId}/event-triggers/rules/${triggerName}`)
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

export default EventTriggers