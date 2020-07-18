class Cluster {
  constructor(client) {
    this.client = client
  }

  fetchConfig() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/cluster`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setConfig(clusterConfig) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/cluster`, clusterConfig)
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


  setClusterLicense(clusterName, licenseKey, licenseValue) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/config/upgrade", { clusterName, licenseKey, licenseValue })
        .then(({ status, data }) => {
          if (status != 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }

  fetchEnv() {
    return new Promise((resolve, reject) => {
      this.client.getJSON("/v1/config/env").then(({ status, data }) => {
        if (status !== 200) {
          reject("Internal server error")
          return
        }
        resolve(data)
      }).catch(ex => reject(ex.toString()))
    })
  }

  refreshToken(token) {
    return new Promise((resolve, reject) => {
      this.client.setToken(token)
      this.client.getJSON("/v1/config/refresh-token").then(({ status, data }) => {
        if (status !== 200) {
          reject("Invalid token")
          return
        }
        resolve(data.token)
      }).catch(ex => reject(ex.toString()))
    })
  }

  login(user, key) {
    return new Promise((resolve, reject) => {
      this.client.postJSON('/v1/config/login', { user, key }).then(({ status, data }) => {
        if (status !== 200) {
          reject(data.error)
          return
        }
        if (!data.token) {
          reject(new Error("Token not returned from Space Cloud"))
          return
        }

        resolve(data.token)
      }).catch(ex => reject(ex.toString()))
    })
  }
}

export default Cluster