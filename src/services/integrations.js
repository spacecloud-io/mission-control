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
            id
            name
            description
            details
            app
            configPermissions
            apiPermissions
            key
            version
            level
            deployments
            secretSource
            hooks
            compatibleVersion
          }
        }`,
        variables: {}
      })
        .then(res => resolve(res.data.integrations))
        .catch(ex => reject(ex))
    })
  }

  fetchInstalledIntegrations() {
    return new Promise((resolve, reject) => {
      this.spaceCloudClient.getJSON(`/v1/config/integrations`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data.result)
        })
        .catch(ex => reject(ex))
    })
  }

  installIntegration(integrationConfig) {
    return new Promise((resolve, reject) => {
      this.spaceCloudClient.postJSON(`/v1/config/integrations`, integrationConfig)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }

  removeIntegration(integrationId) {
    return new Promise((resolve, reject) => {
      this.spaceCloudClient.delete(`/v1/config/integrations/${integrationId}`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }
}

export default Integrations;