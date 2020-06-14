import React from 'react'
import { set as setObjectPath } from "dot-prop-immutable"
import { increment, decrement, set, get } from "automate-redux"
import { notification } from "antd"
import uri from "lil-uri"
import { dbTypes, SPACE_CLOUD_USER_ID, defaultPreparedQueryRule } from './constants';

import store from "./store"
import client from "./client"
import history from "./history"
import { Redirect, Route } from "react-router-dom"
import jwt from 'jsonwebtoken';

const mysqlSvg = require(`./assets/mysqlSmall.svg`)
const postgresSvg = require(`./assets/postgresSmall.svg`)
const mongoSvg = require(`./assets/mongoSmall.svg`)
const sqlserverSvg = require(`./assets/sqlserverIconSmall.svg`)
const embeddedSvg = require('./assets/embeddedSmall.svg')

export function capitalizeFirstCharacter(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getJWTSecret = (state, projectId) => {
  const secrets = getProjectConfig(state.projects, projectId, "secrets", [])
  if (secrets.length === 0) return ""
  return secrets[0].secret
}

export const generateToken = (state, projectId, claims) => {
  const secret = getJWTSecret(state, projectId)
  if (!secret) return ""
  return jwt.sign(claims, secret);
}

export const generateInternalToken = (state, projectId) => {
  const claims = { id: SPACE_CLOUD_USER_ID }
  return generateToken(state, projectId, claims)
};

export const parseDbConnString = conn => {
  if (!conn) return {}
  const url = uri(conn)
  const hostName = url.hostname()
  let path = url.path();
  let urlObj = {
    user: url.user(),
    password: url.password(),
    port: url.port(),
    hostName: hostName,
    query: url.query()
  }
  if (path && path.startsWith("/")) {
    urlObj.dbName = path.substr(1)
  }
  if (hostName && hostName.includes("(")) {
    const temp = hostName.split("(")
    urlObj.protocol = temp[0]
    urlObj.hostName = temp[1]
  }
  if (conn.includes("://")) {
    urlObj.scheme = conn.split("://")[0]
  }
  return urlObj
}
export const getProjectConfig = (projects, projectId, path, defaultValue) => {
  const project = projects.find(project => project.id === projectId)
  if (!project) return defaultValue
  const returnValue = get(project, path, defaultValue)
  return (returnValue == undefined || returnValue == null) ? defaultValue : returnValue
}

export const setProjectConfig = (projectId, path, value) => {
  const projects = get(store.getState(), "projects", [])
  const updatedProjects = projects.map(project => {
    if (project.id === projectId) {
      return setObjectPath(project, path, value)
    }
    return project
  })
  store.dispatch(set("projects", updatedProjects))
}

export const generateId = (len = 32) => {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".slice(0, len).replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const generateJWTSecret = generateId
export const generateAESKey = () => btoa(generateId())

export const generateProjectConfig = (projectId, name) => ({
  name: name,
  id: projectId,
  secrets: [{ secret: generateJWTSecret(), isPrimary: true }],
  aesKey: generateAESKey(),
  contextTime: 5,
  modules: {
    db: {},
    eventing: {},
    userMan: {},
    remoteServices: {
      externalServices: {}
    },
    fileStore: {
      enabled: false,
      rules: []
    }
  }
})

export const notify = (type, title, msg, duration) => {
  notification[type]({ message: title, description: msg.toString(), duration: duration });
}

export const getEventSourceFromType = (type, defaultValue) => {
  let source = defaultValue
  if (type) {
    switch (type) {
      case "DB_INSERT":
      case "DB_UPDATE":
      case "DB_DELETE":
        source = "database"
        break;
      case "FILE_CREATE":
      case "FILE_DELETE":
        source = "file storage"
        break;
      default:
        source = "custom"
    }
  }
  return source
}

export const getEventSourceLabelFromType = (type) => {
  let source = getEventSourceFromType(type)
  return capitalizeFirstCharacter(source)
}

export const getFileStorageProviderLabelFromStoreType = (storeType) => {
  switch (storeType) {
    case "local":
      return "Local Storage"
    case "amazon-s3":
      return "Amazon S3"
    case "gcp-storage":
      return "GCP Storage"
    default:
      return ""
  }
}

export const getSecretType = (type, defaultValue) => {
  let secret = defaultValue
  if (type) {
    switch (type) {
      case "env":
        secret = "Environment Variables"
        break;
      case "docker":
        secret = "Docker Secret"
        break;
      case "file":
        secret = "File Secret"
        break;
      default:
        secret = "Environment Variables"
    }
  }
  return secret
}

export const getEventingDB = (projectId) => {
  return getProjectConfig(store.getState().projects, projectId, "modules.eventing.dbAlias", "")
}

export const openProject = (projectId) => {
  const projects = get(store.getState(), "projects", [])
  const doesExist = projects.some(project => project.id === projectId)
  if (!doesExist) {
    // Check if some other projectExists. If not then redirect to the welcome page
    if (projects.length === 0) {
      history.push(`/mission-control/welcome`)
      return
    }
    projectId = projects[0].id
    notify("info", "Info", "Opened another existing project as the requested project does not exist")
  }
  const currentURL = window.location.pathname
  const projectURL = `/mission-control/projects/${projectId}/`
  if (!currentURL.includes(projectURL)) {
    history.push(projectURL)
  }
}

export const fetchBillingDetails = () => {
  return new Promise((resolve, reject) => {
    client.billing.fetchBillingDetails().then(({ details, amount }) => {
      store.dispatch(set("billing", { status: true, details, balanceCredits: amount }))
      resolve()
    }).catch(ex => reject(ex))
  })
}

export const fetchInvoices = (startingAfter) => {
  return new Promise((resolve, reject) => {
    client.billing.fetchInvoices(startingAfter).then((invoices) => {
      const oldInvoices = store.getState().invoices
      const newInvoices = [...oldInvoices, ...invoices]
      const hasMore = invoices.length === 10
      let invoicesMap = newInvoices.reduce((prev, curr) => Object.assign({}, prev, { [curr.id]: curr }), {})
      const uniqueInvoices = Object.values(invoicesMap)
      const sortedInvoices = uniqueInvoices.sort((a, b) => a.number < b.number ? -1 : 1)
      store.dispatch(set("invoices", sortedInvoices))
      resolve(hasMore)
    }).catch(ex => reject(ex))
  })
}

export const fetchClusters = () => {
  return new Promise((resolve, reject) => {
    client.billing.fetchClusters().then((clusters) => {
      store.dispatch(set("clusters", clusters))
      resolve()
    }).catch(ex => reject(ex))
  })
}

export const fetchGlobalEntities = (token, spaceUpToken) => {
  // Save the new token value
  if (token) {
    saveToken(token)
  }

  if (spaceUpToken) {
    saveSpaceUpToken(spaceUpToken)
  }

  // Redirect if needed
  const { redirect, redirectUrl } = shouldRedirect()
  if (redirect) {
    history.push(redirectUrl)
    return
  }

  if (shouldFetchGlobalEntities()) {
    // Fetch projects
    store.dispatch(increment("pendingRequests"))
    client.projects.getProjects().then(projects => {
      store.dispatch(set("projects", projects))
      if (projects.length === 0) {
        history.push(`/mission-control/welcome`)
        return
      }

      // Decide which project to open
      let projectToBeOpened = getProjectToBeOpened()
      if (!projectToBeOpened) {
        projectToBeOpened = projects[0].id
      }

      openProject(projectToBeOpened)
    }).catch(ex => notify("error", "Could not fetch projects", ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))

    store.dispatch(increment("pendingRequests"))
    client.fetchCredentials()
      .then(data => store.dispatch(set("credentials", data)))
      .catch(ex => notify("error", "Error fetching credentials", ex.toString()))
      .finally(() => store.dispatch(decrement("pendingRequests")))

    if (spaceUpToken) {
      store.dispatch(increment("pendingRequests"))
      fetchBillingDetails()
        .catch(ex => console.log("Error fetching billing details", ex))
        .finally(() => store.dispatch(decrement("pendingRequests")))
    }
  }
}

function shouldFetchGlobalEntities() {
  const prodMode = isProdMode()
  const token = getToken()

  if (prodMode && !token) return false
  return true
}

function getTokenClaims(token) {
  const temp = token.split(".")
  const decoded = atob(temp[1])
  let claims = {}
  try {
    const decodedObj = JSON.parse(decoded)
    claims = decodedObj
  } catch (error) {
    console.log("Error decoding token", error)
  }
  return claims
}

export function isProdMode() {
  return localStorage.getItem("isProd") === "true" ? true : false
}

export function isBillingEnabled(state) {
  return get(state, "billing.status", false)
}

export function isSignedIn() {
  const spaceUpToken = getSpaceUpToken()
  return spaceUpToken ? true : false
}

export function getClusterId(state) {
  return get(state, "env.clusterId", undefined)
}

export function getClusterPlan(state) {
  const plan = get(state, "env.plan", "space-cloud-open--monthly")
  return plan ? plan : "space-cloud-open--monthly"
}

export function getToken() {
  return localStorage.getItem("token")
}
export function getSpaceUpToken() {
  return localStorage.getItem("spaceUpToken")
}


function storeToken(token) {
  localStorage.setItem("token", token)
}

function storeSpaceUpToken(token) {
  localStorage.setItem("spaceUpToken", token)
}

function saveToken(token) {
  storeToken(token)
  client.setToken(token)
}

function saveSpaceUpToken(token) {
  // Get claims of the token
  const { email, name } = getTokenClaims(token)

  // Save token claims to local storage
  localStorage.setItem("email", email)
  localStorage.setItem("name", name)

  // Save token to local storage and set the token on the API
  storeSpaceUpToken(token)
}

function saveEnv(isProd, version, clusterId, plan, quotas) {
  localStorage.setItem("isProd", isProd.toString())
  store.dispatch(set("env", { version, clusterId, plan, quotas }))
}

function isCurrentRoutePublic() {
  const path = window.location.pathname.split("/")[2]
  return (path === "login")
}

function shouldRedirect() {
  // Check if we are at a public route
  if (isCurrentRoutePublic()) {
    return { redirect: false, redirectUrl: "" }
  }

  const productionMode = localStorage.getItem("isProd") === "true"
  const token = getToken()

  if (productionMode && !token) {
    return { redirect: true, redirectUrl: "/mission-control/login" }
  }

  return { redirect: false, redirectUrl: "" }
}

function redirectIfNeeded() {
  const { redirect, redirectUrl } = shouldRedirect()
  if (redirect) {
    history.push(redirectUrl)
    return
  }
}

const getProjectToBeOpened = () => {
  let projectId = null
  const urlParams = window.location.pathname.split("/")
  if (urlParams.length > 3 && urlParams[3]) {
    projectId = urlParams[3]
  }
  return projectId
}

export const onAppLoad = () => {
  client.fetchEnv().then(({ isProd, version, clusterId, plan, quotas }) => {
    // Store env
    saveEnv(isProd, version, clusterId, plan, quotas)

    // Redirect if needed
    redirectIfNeeded()

    const token = getToken()
    const spaceUpToken = getSpaceUpToken()
    if (token) {
      client.refreshToken(token).then(token => fetchGlobalEntities(token, spaceUpToken)).catch(ex => {
        console.log("Error refreshing token: ", ex.toString())
        localStorage.removeItem("token")
        redirectIfNeeded()
      })
      return
    }

    fetchGlobalEntities(token, spaceUpToken)
  })
}

export function enterpriseSignin(token) {
  return new Promise((resolve, reject) => {
    client.billing.signIn(token)
      .then(newToken => {
        saveSpaceUpToken(newToken)
        fetchBillingDetails().finally(() => resolve())
      })
      .catch((error) => reject(error))
  })
}

export function registerCluster(clusterName, doesExist = false) {
  return new Promise((resolve, reject) => {
    const isClusterIdAlreadySet = getClusterId(store.getState()) ? true : false
    if (isClusterIdAlreadySet) {
      reject(new Error("This space cloud cluster is already registered"))
      return
    }

    client.billing.registerCluster(clusterName, doesExist)
      .then(({ ack, clusterId, clusterKey }) => {
        if (!ack) {
          resolve({ registered: false })
          return
        }

        client.setClusterIdentity(clusterId, clusterKey)
          .then(() => {
            resolve({ registered: true, notifiedToCluster: true })
            store.dispatch(set("env.clusterId", clusterId))
            client.fetchEnv().then(({ isProd, version, clusterId, plan, quotas }) => saveEnv(isProd, version, clusterId, plan, quotas))
          })
          .catch(ex => resolve({ registered: true, notifiedToCluster: false, exceptionNotifyingToCluster: ex }))
      })
      .catch(ex => reject(ex))
  })
}

export function setClusterPlan(plan) {
  return new Promise((resolve, reject) => {
    const clusterId = getClusterId(store.getState())
    client.billing.setPlan(clusterId, plan)
      .then((plan) => {
        client.renewClusterLicense()
          .then(() => {
            store.dispatch(set("env.plan", plan))
            resolve()
          })
          .catch(ex => reject(ex))
      })
      .catch(ex => reject(ex))
  })
}

export function applyCoupon(couponCode) {
  return new Promise((resolve, reject) => {
    client.billing.applyCoupon(couponCode)
      .then((couponValue) => {
        if (couponValue < 0) couponValue = couponValue * -1
        store.dispatch(increment("billing.balanceCredits", couponValue))
        resolve(couponValue)
      })
      .catch(ex => reject(ex))
  })
}

export const PrivateRoute = ({ component: Component, ...rest }) => {
  const { redirect, redirectUrl } = shouldRedirect()
  return (
    <Route
      {...rest}
      render={props =>
        redirect ? (
          <Redirect to={redirectUrl} />
        ) : (
            <Component {...props} />
          )
      }
    />
  )
}


export const BillingRoute = ({ component: Component, ...rest }) => {
  const billingEnabled = isBillingEnabled(store.getState())
  return (
    <Route
      {...rest}
      render={props =>
        !billingEnabled ? (
          <Redirect to={`/mission-control/projects/${rest.computedMatch.params.projectID}/billing`} />
        ) : (
            <PrivateRoute {...props} component={Component} />
          )
      }
    />
  )
}

export const getDBTypeFromAlias = (projectId, alias) => {
  const projects = get(store.getState(), "projects", [])
  return getProjectConfig(projects, projectId, `modules.db.${alias}.type`, alias)
}

export const canDatabaseHavePreparedQueries = (projectId, dbAlias) => {
  const dbType = getDBTypeFromAlias(projectId, dbAlias)
  return [dbTypes.POSTGRESQL, dbTypes.MYSQL, dbTypes.SQLSERVER].some(value => value === dbType)
}

export const getDefaultPreparedQueriesRule = (projectId, dbAliasName) => {
  return getProjectConfig(store.getState().projects, projectId, `modules.db.${dbAliasName}.preparedQueries.default.rule`, defaultPreparedQueryRule)
}

export const getDatabaseLabelFromType = (dbType) => {
  switch (dbType) {
    case dbTypes.MONGO: 
    return "MongoDB"
    case dbTypes.POSTGRESQL: 
    return "PostgreSQL"
    case dbTypes.MYSQL: 
    return "MySQL"
    case dbTypes.SQLSERVER: 
    return "SQL Server"
    case dbTypes.EMBEDDED: 
    return "Embedded"
  }
}

export const dbIcons = (project, projectId, selectedDb) => {

  const dbModule = getProjectConfig(project, projectId, "modules.db", {})

  let checkDB = ''
  if (dbModule[selectedDb]) checkDB = dbModule[selectedDb].type

  var svg = mongoSvg
  switch (checkDB) {
    case dbTypes.MONGO:
      svg = mongoSvg
      break;
    case dbTypes.MYSQL:
      svg = mysqlSvg
      break;
    case dbTypes.POSTGRESQL:
      svg = postgresSvg
      break;
    case dbTypes.SQLSERVER:
      svg = sqlserverSvg
      break;
    case dbTypes.EMBEDDED:
      svg = embeddedSvg
      break;
    default:
      svg = postgresSvg
  }
  return svg;
}

const getProjects = state => state.projects

export const getTrackedCollectionNames = (state, projectId, dbName) => {
  const projects = getProjects(state)
  const collections = getProjectConfig(projects, projectId, `modules.db.${dbName}.collections`, {})
  const trackedCollections = Object.keys(collections)
    .filter(colName => colName !== "default" && colName !== "event_logs" && colName !== "invocation_logs")
  return trackedCollections
}

export const getTrackedCollections = (state, projectId, dbName) => {
  const projects = getProjects(state)
  const collections = getProjectConfig(projects, projectId, `modules.db.${dbName}.collections`, {})
  const trackedCollections =  Object.keys(collections)
  .filter(colName => colName !== "default" && colName !== "event_logs" && colName !== "invocation_logs")
  .reduce((obj, key) => {
    obj[key] = collections[key];
    return obj;
  }, {})
  return trackedCollections
}

export const getSchema = (projectId, dbName, colName) => {
  return getProjectConfig(store.getState().projects, projectId, `modules.db.${dbName}.collections.${colName}.schema`, "")
}

export const parseJSONSafely = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}