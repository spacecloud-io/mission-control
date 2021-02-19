class Addons {
    constructor(client) {
      this.client = client
    }
  
    setAddonConfig(type, config) {
      return new Promise((resolve, reject) => {
        this.client.postJSON(`/v1/config/add-ons/${type}/${type}`, config)
        .then(({ status, data }) => {
            if (status < 200 || status >= 300) {
              reject({title: data.error, msg: data.rawError})
              return
            }
            resolve()
          })
          .catch(ex => reject({title: "Failed to set addon config", msg: ex.message}))
      })
    }

    getAddonConfig(type) {
      return new Promise((resolve, reject) => {
        this.client.getJSON(`/v1/config/add-ons/${type}/${type}`)
        .then(({ status, data }) => {
            if (status < 200 || status >= 300) {
                reject({title: data.error, msg: data.rawError})
                return
            }
            resolve(data.result)
        })
        .catch(ex => reject({title: "Failed to get addon config", msg: ex.message}))
      })
    }

    getAddonConnStatus(type) {
        return new Promise((resolve, reject) => {
            this.client.getJSON(`/v1/external/add-ons/${type}/${type}/connection-state`)
            .then(({ status, data }) => {
                if (status < 200 || status >= 300) {
                    reject({title: data.error, msg: data.rawError})
                    return
                }
                resolve(data.result)
            })
            .catch(ex => reject({title: "Failed to get addon connection status", msg: ex.message}))
        })
    }
}

export default Addons