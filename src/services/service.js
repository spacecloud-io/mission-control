import Client from "./client";
import SpaceAPI from 'space-api';

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
import firebaseConfig from './firebaseConfig'
import Clusters from "./clusters"
import Billing from "./billing";

import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import * as firebase from "firebase/app";
import "firebase/auth";

const API = SpaceAPI.API
const cond = SpaceAPI.cond
const and = SpaceAPI.and

class Service {
  constructor() {
    firebase.initializeApp(firebaseConfig);
    this.client = new Client()
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
    this.clusters = new Clusters(this.client)
    this.billing = new Billing(this.client)
    const token = localStorage.getItem("token")
    if (token) this.client.setToken(token);
  }

  setToken(token) {
    this.client.setToken(token)
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

  fetchQuotas() {
    return new Promise((resolve, reject) => {
      this.client.getJSON("/v1/config/quotas").then(({ status, data }) => {
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

        resolve(data.token)
      }).catch(ex => reject(ex.toString()))
    })
  }

  enterpriseSignin(token) {
    return new Promise((resolve, reject) => {
      this.client.postJSON('/v1/config/login', { token: token }).then(({ status, data }) => {
        if (status !== 200) {
          reject(data.error)
          return
        }

        resolve(data.token)
      }).catch(ex => reject(ex.toString()))
    })
  }

  execSpaceAPI(projectId, code, token) {
    return new Promise((resolve, reject) => {
      const url = process.env.NODE_ENV !== "production" ? "http://localhost:4122" : undefined
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
    return new Promise((resolve, reject) => {
      let uri = `/v1/api/${projectId}/graphql`
      if (process.env.NODE_ENV !== "production") {
        uri = "http://localhost:4122" + uri;
      }
      const cache = new InMemoryCache({ addTypename: false });
      const link = new HttpLink({ uri: uri, headers: { "Authorization": `Bearer ${token}` } });
      const client = new ApolloClient({
        cache: cache,
        link: link
      });
      if (graphqlQuery.includes("mutation")) {
        client.mutate({
          mutation: gql`${graphqlQuery}`,
          variables: variables
        }).then(result => resolve(result.data)).catch(ex => reject(ex))
      } else {
        client.query({
          query: gql`${graphqlQuery}`,
          variables: variables
        }).then(result => resolve(result.data)).catch(ex => reject(ex))
      }
    })
  }
}

export default Service