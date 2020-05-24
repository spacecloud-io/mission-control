import SpaceAPI from 'space-api';
import gql from 'graphql-tag';
import { spaceCloudClusterOrigin, enterpriseServerGraphQLURL } from "../constants"
import { getSpaceUpToken } from "../utils"
import { createRESTClient, createGraphQLClient } from "./client";

import Database from "./database"
import FileStore from "./fileStore"
import Eventing from "./eventing"
import RemoteServices from "./remoteServices"
import UserManagement from "./userManagement"
import Projects from "./projects"
import Deployments from "./deployments"
import Routes from "./routes"
import LetsEncrypt from "./letsencrypt"
import Secrets from "./secrets"
import Billing from "./billing";

const API = SpaceAPI.API
const cond = SpaceAPI.cond
const and = SpaceAPI.and

class Service {
  constructor(token, spaceUpToken) {
    this.client = createRESTClient(spaceCloudClusterOrigin)
    this.spaceSiteClient = createRESTClient("https://api.spaceuptech.com", { credentials: "omit" })
    this.enterpriseClient = createGraphQLClient(enterpriseServerGraphQLURL, getSpaceUpToken)
    this.database = new Database(this.client)
    this.fileStore = new FileStore(this.client)
    this.eventing = new Eventing(this.client)
    this.remoteServices = new RemoteServices(this.client)
    this.userManagement = new UserManagement(this.client)
    this.projects = new Projects(this.client)
    this.deployments = new Deployments(this.client)
    this.routing = new Routes(this.client)
    this.letsencrypt = new LetsEncrypt(this.client)
    this.secrets = new Secrets(this.client)
    this.billing = new Billing(this.enterpriseClient, this.spaceSiteClient)
    if (token) this.client.setToken(token);
  }

  setToken(token) {
    this.client.setToken(token)
  }

  setSpaceUpToken(token) {
    this.enterpriseClient.setToken(token)
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

  fetchCredentials() {
    return new Promise((resolve, reject) => {
      this.client.getJSON("/v1/config/credentials").then(({ status, data }) => {
        if (status !== 200) {
          reject("Internal server error")
          return
        }
        resolve(data.result)
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

  setClusterIdentity(clusterId, clusterKey) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/config/upgrade", { clusterId, clusterKey })
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

  renewClusterLicense() {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/config/renew-license", {})
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

  execSpaceAPI(projectId, code, token) {
    return new Promise((resolve, reject) => {
      const url = process.env.REACT_APP_DISABLE_MOCK ? "http://localhost:4122" : undefined
      const api = new API(projectId, url)
      if (token) {
        api.setToken(token)
      }
      const cond = SpaceAPI.cond
      const and = SpaceAPI.and
      const or = SpaceAPI.or
      try {
        const promise = eval(code)
        if (!promise || !promise.then) {
          reject("Not a valid Space Cloud API call")
        }
        promise.then(res => resolve(res)).catch(ex => reject(ex.toString()))
      } catch (ex) {
        reject(ex.toString())
      }
    })
  }

  execGraphQLQuery(projectId, graphqlQuery, variables, token) {
    let uri = `/v1/api/${projectId}/graphql`
    if (spaceCloudClusterOrigin) {
      uri = "http://localhost:4122" + uri;
    }
    const client = createGraphQLClient(uri, () => token)
    return new Promise((resolve, reject) => {
      if (graphqlQuery.includes("mutation")) {
        client.mutate({
          mutation: gql`${graphqlQuery}`,
          variables: variables
        }).then(({ data, errors }) => resolve({ data, errors })).catch(ex => reject(ex))
      } else {
        client.query({
          query: gql`${graphqlQuery}`,
          variables: variables
        }).then(({ data, errors }) => resolve({ data, errors })).catch(ex => reject(ex))
      }
    })
  }
}

export default Service