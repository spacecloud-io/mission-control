import Client from "./client";
import SpaceAPI from 'space-api';

import Database from "./database"
import FileStore from "./fileStore"
import EventTriggers from "./eventTriggers"
import RemoteServices from "./remoteServices"
import UserManagement from "./userManagement"
import Projects from "./projects"

import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const API = SpaceAPI.API
const cond = SpaceAPI.cond
const and = SpaceAPI.and

class Service {
  constructor() {
    this.client = new Client()
    this.database = new Database(this.client)
    this.fileStore = new FileStore(this.client)
    this.eventTriggers = new EventTriggers(this.client)
    this.remoteServices = new RemoteServices(this.client)
    this.userManagement = new UserManagement(this.client)
    this.projects = new Projects(this.client)
  }

  setToken(token) {
    this.client.setToken(token)
  }

  fetchEnv() {
    return new Promise((resolve, reject) => {
      this.client.getJSON("/v1/config/env").then(({ status, data }) => {
        if (status !== 200) {
          reject("Internal server error")
          return
        }
        resolve(data.isProd)
      }).catch(ex => reject(ex.toString()))
    })
  }

  login(user, pass) {
    return new Promise((resolve, reject) => {
      this.client.postJSON('/v1/config/login', { user, pass }).then(({ status, data }) => {
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