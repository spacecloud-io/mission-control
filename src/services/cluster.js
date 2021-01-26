class Cluster {
  constructor(client) {
    this.client = client
  }

  fetchConfig() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/cluster`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : {})
        })
        .catch(ex => reject({title: "Failed to get cluster", msg: ex.message}))
    })
  }

  fetchPermissions() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/permissions`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get permission", msg: ex.message}))
    })
  }

  setConfig(clusterConfig) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/cluster`, clusterConfig)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set cluster", msg: ex.message}))
    })
  }


  setClusterLicense(clusterName, licenseKey, licenseValue) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/config/upgrade", { clusterName, licenseKey, licenseValue })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve()
        })
        .catch(ex => reject({title: "Failed to set cluster", msg: ex.message}))
    })
  }

  setOfflineClusterLicense(license) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/config/offline-license", { license })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve()
        })
        .catch(ex => reject({title: "Failed to set cluster", msg: ex.message}))
    })
  }

  removeClusterLicense() {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/config/degrade", {})
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve()
        })
        .catch(ex => reject({title: "Failed to set cluster", msg: ex.message}))
    })
  }

  fetchEnv() {
    return new Promise((resolve, reject) => {
      this.client.getJSON("/v1/config/env").then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject({title: data.error, msg: data.rawError})
          return
        }
        resolve(data ? data : {})
      }).catch(ex => reject({title: "Failed to get env", msg: ex.message}))
    })
  }

  refreshToken(token) {
    return new Promise((resolve, reject) => {
      this.client.setToken(token)
      this.client.getJSON("/v1/config/refresh-token").then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          resolve({ refreshed: false })
          return
        }

        this.client.setToken(data.token)
        resolve({ refreshed: true, token: data.token })
      }).catch(ex => reject({title: "Failed to refresh token", msg: ex.message}))
    })
  }

  login(user, key) {
    return new Promise((resolve, reject) => {
      this.client.postJSON('/v1/config/login', { user, key }).then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject({title: data.error, msg: data.rawError})
          return
        }
        if (!data.token) {
          reject(new Error("Token not returned from Space Cloud"))
          return
        }

        this.client.setToken(data.token)
        resolve(data.token)
      }).catch(ex => reject({title: "Failed to login", msg: ex.message}))
    })
  }
}

export default Cluster