class ClusterConfig {
  constructor(client) {
    this.client = client
  }

  getConfig() {
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

}

export default ClusterConfig