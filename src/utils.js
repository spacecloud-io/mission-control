import React from 'react'
import { set as setObjectPath } from "dot-prop-immutable"
import { increment, decrement, set, get } from "automate-redux"
import { notification } from "antd"
import uri from "lil-uri"
import { dbTypes } from './constants';

import store from "./store"
import client from "./client"
import history from "./history"
import { defaultDbConnectionStrings } from "./constants"
import { Redirect, Route } from "react-router-dom"
import * as firebase from 'firebase/app';
import 'firebase/auth';

const mysqlSvg = require(`./assets/mysqlSmall.svg`)
const postgresSvg = require(`./assets/postgresSmall.svg`)
const mongoSvg = require(`./assets/mongoSmall.svg`)
const sqlserverSvg = require(`./assets/sqlserverIconSmall.svg`)

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

export const generateId = () => {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const getConnString = (dbType) => {
  const connString = defaultDbConnectionStrings[dbType]
  return connString ? connString : "localhost"
}

export const generateProjectConfig = (projectId, name) => ({
  name: name,
  id: projectId,
  secret: generateId(),
  aesKey: btoa(generateId()),
  contextTime: 5,
  modules: {
    crud: {},
    eventing: {},
    auth: {},
    services: {
      externalServices: {}
    },
    fileStore: {
      enabled: false,
      rules: []
    }
  }
})

export const notify = (type, title, msg, duration) => {
  notification[type]({ message: title, description: msg, duration: duration });
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
  return source.charAt(0).toUpperCase() + source.slice(1)
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

export const openProject = (projectId) => {
  console.log("Open Project called")
  const currentURL = window.location.pathname
  const projectURL = `/mission-control/projects/${projectId}`
  if (!currentURL.includes(projectURL)) {
    history.push(projectURL)
  }
  const projects = get(store.getState(), "projects", [])
  const config = projects.find(project => project.id === projectId)
  if (!config) {
    notify("error", "Error", "Project does not exist")
    return
  }
}


export const fetchGlobalEntities = (token) => {
  // Save the new token value
  if (token) {
    storeToken(token)
  }

  // Redirect if needed
  redirectIfNeeded()

  // Fetch projects
  if (shouldFetchProjects()) {
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
  }
}

const storeEnv = (enterpriseMode, isProd, version) => {
  if (enterpriseMode !== undefined && enterpriseMode !== null) {
    localStorage.setItem("enterprise",  enterpriseMode.toString())
  }
  localStorage.setItem("isProd", isProd.toString())
  store.dispatch(set("version", version))
}

const isProdMode = () => localStorage.getItem("isProd") === "true" ? true : false
const isEnterprise = () => localStorage.getItem("enterprise") === "true" ? true : false
const isEmailVerified = () => localStorage.getItem("isEmailVerified") === "true" ? true : false
const getToken = () => localStorage.getItem("token")
export const getFirebaseToken = () => localStorage.getItem("firebase-token")
export const storeFirebaseToken = (token) => localStorage.set("firebase-token", token)

const shouldFetchProjects = () => {
  const prodMode = isProdMode()
  const enterprise = isEnterprise()
  const emailVerified = isEmailVerified()
  const token = getToken()

  if (prodMode && !token) return false
  if (enterprise && (!emailVerified || !token)) return false
  return true
}

const getTokenClaims = (token) => {
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

const storeToken = (token) => {
  // Get claims of the token
  const { email, name, isEmailVerified } = getTokenClaims(token)

  // Save token claims to local storage
  localStorage.setItem("email", email)
  localStorage.setItem("name", name)
  localStorage.setItem("isEmailVerified", isEmailVerified.toString())

  // Save token to local storage and set the token on the API
  localStorage.setItem("token", token)
  client.setToken(token)
}

const shouldRedirect = () => {
  // Check if we are at a public route
  const path = window.location.pathname.split("/")[2]
  if (path === "signup" || path === "signin" || path === "login" || path === "email-verification" || path === "email-action-handler") {
    return { redirect: false, redirectUrl: "" }
  }

  const enterpriseMode = localStorage.getItem("enterprise") === "true"
  const productionMode = localStorage.getItem("isProd") === "true"
  const isEmailVerified = localStorage.getItem("isEmailVerified") === "true"
  const token = localStorage.getItem("token")

  if (enterpriseMode && !token) {
    return { redirect: true, redirectUrl: "/mission-control/signin" }
  }

  if (enterpriseMode && !isEmailVerified) {
    return { redirect: true, redirectUrl: "/mission-control/email-verification" }
  }

  if (productionMode && !token) {
    return { redirect: true, redirectUrl: "/mission-control/login" }
  }

  return { redirect: false, redirectUrl: "" }
}

const redirectIfNeeded = () => {
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

export const handleInvoices = () => {
  client.billing.getBillingInvoices().then(res => {
      if(res.status){
          store.dispatch(set("billing", res))
      }
  }).catch(ex => console.log(ex))
}

export const fetchCluster = () => {
  client.clusters.getClusters()
  .then(clusters => {
      store.dispatch(set(`clusters`, clusters))
  })
  .catch(ex => notify("error", "Error fetching clusters", ex.toString()))
}

export const onAppLoad = () => {
  client.fetchEnv().then(({ enterprise, isProd, version }) => {
    // Store env
    storeEnv(enterprise, isProd, version)

    // Redirect if needed
    redirectIfNeeded()

    const token = localStorage.getItem("token")
    if (token) {
      client.refreshToken(token).then(token => fetchGlobalEntities(token, isProd, enterprise)).catch(ex => {
        console.log("Error refreshing token: ", ex.toString())
        localStorage.removeItem("token")
        redirectIfNeeded()
      })
      return
    }
    fetchCluster()
    fetchGlobalEntities(token, enterprise, isProd)
  })
}

export const enterpriseSignin = (token) => {
  return new Promise((resolve, reject) => {
    storeFirebaseToken(token)
    client.enterpriseSignin(token).then(newToken => {
      fetchGlobalEntities(newToken, true, true)
      resolve()
    }).catch((error) => {
      reject(error)
    })
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

export const getDBTypeFromAlias = (projectId, alias) => {
  const projects = get(store.getState(), "projects", [])
  return getProjectConfig(projects, projectId, `modules.crud.${alias}.type`, alias)
}


export const dbIcons = (project, projectId, selectedDb) => {

  const crudModule = getProjectConfig(project, projectId, "modules.crud", {})

  let checkDB = ''
  if (crudModule[selectedDb]) checkDB = crudModule[selectedDb].type

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
    default:
      svg = postgresSvg
  }
  return svg;
}