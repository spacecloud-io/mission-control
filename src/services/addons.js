class Addons {
    constructor(client) {
      this.client = client
    }
  
    setAddonConfig(type, config) {
      return new Promise((resolve, reject) => {
        this.client.postJSON(`/v1/config/add-ons/${type}/${type}`, config)
        .then(({ status, data }) => {
            if (status < 200 || status >= 300) {
              reject(data.error)
              return
            }
            resolve()
          })
          .catch(ex => reject(ex.toString()))
      })
    }

    getAddonConfig(type) {
      return new Promise((resolve, reject) => {
        this.client.getJSON(`/v1/config/add-ons/${type}/${type}`)
        .then(({ status, data }) => {
            if (status < 200 || status >= 300) {
                reject(data.error)
                return
            }
            resolve(data.result)
        })
        .catch(ex => reject(ex.toString()))
      })
    }

    getAddonConnStatus(type) {
        return new Promise((resolve, reject) => {
            this.client.getJSON(`/v1/external/add-ons/${type}/${type}/connection-state`)
            .then(({ status, data }) => {
                if (status < 200 || status >= 300) {
                    reject(data.error)
                    return
                }
                resolve(data.result)
            })
            .catch(ex => reject(ex.toString()))
        })
    }
}

export default Addons