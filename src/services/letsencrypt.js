class LetsEncrypt {
  constructor(client) {
    this.client = client
  }

  fetchConfig(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/letsencrypt/config`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }

          const letsencryptConfig = data.result && data.result[0] ? data.result[0] : {}
          resolve(letsencryptConfig)
        })
        .catch(ex => reject({title: "Failed to get letsencrypt", msg: ex.message}))
    })
  }

  setConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/letsencrypt/config/letsencrypt-config`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set letsencrypt", msg: ex.message}))
    })
  }
}

export default LetsEncrypt