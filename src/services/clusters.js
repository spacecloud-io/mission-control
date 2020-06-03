class Clusters {
  constructor(client) {
    this.client = client
  }

  getClustersConfig() {
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

  setClustersConfig(clusterConfig) {
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

export default Clusters