import gql from 'graphql-tag';

class Integrations {
  constructor(spaceCloudClient, spaceUpClient) {
    this.spaceCloudClient = spaceCloudClient;
    this.spaceUpClient = spaceUpClient;
  }

  fetchSupportedIntegrations() {
    return new Promise((resolve, reject) => {
      this.spaceUpClient.query({
        query: gql`
        query {
          integrations @db {
            config
          }
        }`,
        variables: {}
      })
        .then(res => {
          const integrations = res.data && res.data.integrations ? res.data.integrations : []
          resolve(integrations.map(obj => obj.config))
        })
        .catch(ex => reject(ex))
    })
  }

  fetchInstalledIntegrations() {
    return new Promise((resolve, reject) => {
      this.spaceCloudClient.getJSON(`/v1/config/integrations`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get integration", msg: ex.message}))
    })
  }

  installIntegration(integrationConfig) {
    return new Promise((resolve, reject) => {
      this.spaceCloudClient.postJSON(`/v1/config/integrations`, integrationConfig)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set integration", msg: ex.message}))
    })
  }

  fetchIntegrationStatus(healthCheckUrl) {
    return new Promise((resolve, reject) => {
      this.spaceCloudClient.getJSON(healthCheckUrl)
        .then(({ status, data }) => {
          if (status >= 200 && status < 300) {
            resolve({ ack: true, retry: false })
            return
          }
          if (status >= 400 && status < 500) {
            resolve({ ack: false, retry: true })
            return
          }
          resolve({ ack: false, retry: false, error: data.error })
        })
        .catch(ex => reject({title: "Failed to get integration status", msg: ex.message}))
    })
  }

  removeIntegration(integrationId) {
    return new Promise((resolve, reject) => {
      this.spaceCloudClient.delete(`/v1/config/integrations/${integrationId}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete integration", msg: ex.message}))
    })
  }
}

export default Integrations;