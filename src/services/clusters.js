
class Clusters {
    constructor(client) {
        this.client = client
    }

    getClusters() {
        return new Promise((resolve, reject) => {
            this.client.getJSON('/v1/config/clusters')
                .then(({ status, data }) => {
                    if (status !== 200) {
                        reject(data.error)
                        return
                    }
                    resolve(data.clusters)
                })
                .catch(ex => reject(ex.toString()))
        })
    }

    registerCluster(name, username, key, url) {
        return new Promise((resolve, reject) => {
            this.client.postJSON(`/v1/config/clusters/${name}`, { id: name, username, key, url })
                .then(({ status, data }) => {
                    if (status != 200) {
                        reject(data.error)
                        return
                    }
                    resolve(data.clusterType)
                })
                .catch(ex => reject(ex.toString()))
        })
    }

    addCluster(projectId, name) {
        return new Promise((resolve, reject) => {
            this.client.postJSON(`/v1/config/clusters/${name}/projects`, { projectId })
                .then(({ status, data }) => {
                    if (status !== 200) {
                        reject(data.error)
                        return
                    }
                    resolve(data.status)
                })
                .catch(ex => reject(ex.toString()))
        })
    }

    removeCluster(projectId, name) {
        return new Promise((resolve, reject) => {
            this.client.delete(`/v1/config/clusters/${name}/projects`, { projectId })
                .then(({ status, data }) => {
                    if (status !== 200) {
                        reject(data.error)
                        return
                    }
                    resolve(data.status)
                })
                .catch(ex => reject(ex.toString()))
        })
    }
}

export default Clusters