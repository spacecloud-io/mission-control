import SpaceAPI from 'space-api';
import gql from 'graphql-tag';
import { spaceCloudClusterOrigin, spaceUpAPIGraphQLURL } from "../constants"
import { createRESTClient, createGraphQLClient } from "./client";

import Database from "./database"
import FileStore from "./fileStore"
import Cache from "./cache";
import Eventing from "./eventing"
import RemoteServices from "./remoteServices"
import UserManagement from "./userManagement"
import Projects from "./projects"
import Deployments from "./deployments"
import Routes from "./routes"
import LetsEncrypt from "./letsencrypt"
import Secrets from "./secrets"
import Cluster from "./cluster";
import Integrations from "./integrations";
import Addons from './addons';

const API = SpaceAPI.API
const cond = SpaceAPI.cond
const and = SpaceAPI.and

class Service {
  constructor(token) {
    this.client = createRESTClient(spaceCloudClusterOrigin)
    this.spaceAPIClient = createGraphQLClient(spaceUpAPIGraphQLURL)
    this.spaceSiteClient = createRESTClient("https://api.spaceuptech.com", { credentials: "omit" })
    this.database = new Database(this.client)
    this.fileStore = new FileStore(this.client)
    this.cache = new Cache(this.client)
    this.eventing = new Eventing(this.client)
    this.remoteServices = new RemoteServices(this.client)
    this.userManagement = new UserManagement(this.client)
    this.projects = new Projects(this.client)
    this.deployments = new Deployments(this.client)
    this.routing = new Routes(this.client)
    this.letsencrypt = new LetsEncrypt(this.client)
    this.secrets = new Secrets(this.client)
    this.cluster = new Cluster(this.client)
    this.integrations = new Integrations(this.client, this.spaceAPIClient)
    this.addons = new Addons(this.client)
    if (token) this.client.setToken(token);
  }

  execSpaceAPI(projectId, code, token) {
    return new Promise((resolve, reject) => {
      const api = new API(projectId, spaceCloudClusterOrigin)
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