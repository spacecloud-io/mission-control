import React from 'react'
import { set as setObjectPath } from "dot-prop-immutable"
import { increment, decrement, set, get } from "automate-redux"
import { notification } from "antd"
import uri from "lil-uri"
import qs from 'qs';
import { dbTypes, securityRuleGroups, moduleResources, configResourceTypes, actionQueuedMessage } from './constants';

import store from "./store"
import history from "./history"
import { Redirect, Route, useHistory } from "react-router-dom"
import jwt from 'jsonwebtoken';
import { loadProjects, getJWTSecret, loadProjectAPIToken } from './operations/projects'
import { getDbType, setPreparedQueryRule, setColSecurityRule, getDbConfigs } from './operations/database'
import { setRemoteEndpointRule } from './operations/remoteServices'
import { setIngressRouteRule } from './operations/ingressRoutes'
import { setEventingSecurityRule } from './operations/eventing'
import { setFileStoreSecurityRule } from './operations/fileStore'
import { loadClusterEnv, refreshClusterTokenIfPresent, loadPermissions, isLoggedIn, getPermisions, getLoginURL } from './operations/cluster'
import { useSelector } from 'react-redux'

const mysqlSvg = require(`./assets/mysqlSmall.svg`)
const postgresSvg = require(`./assets/postgresSmall.svg`)
const mongoSvg = require(`./assets/mongoSmall.svg`)
const sqlserverSvg = require(`./assets/sqlserverIconSmall.svg`)
const embeddedSvg = require('./assets/embeddedSmall.svg')

const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function getGraphQLEndpoints(projectId) {
  const protocol = window.location.protocol
  const host = window.location.host
  let httpProtocol, wsProtocol;

  if (protocol === "https:") {
    httpProtocol = "https:"
    wsProtocol = "wss:"
  } else {
    httpProtocol = "http:"
    wsProtocol = "ws:"
  }

  const httpUrl = `${httpProtocol}//${host}/v1/api/${projectId}/graphql`
  const websocketUrl = `${wsProtocol}//${host}/v1/api/${projectId}/graphql/socket`

  return { httpUrl, websocketUrl }
}

export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function saveObjectToLocalStorage(key, obj) {
  const value = JSON.stringify(obj)
  localStorage.setItem(key, value)
}

export function getObjectFromLocalStorage(key) {
  try {
    const value = localStorage.getItem(key)
    const obj = JSON.parse(value)
    return Promise.resolve(obj)
  } catch (error) {
    return Promise.reject(String(error))
  }
}

export function upsertArray(array, predicate, getItem) {
  const index = array.findIndex(predicate)
  return index === -1 ? [...array, getItem()] : [...array.slice(0, index), getItem(array[index]), ...array.slice(index + 1)]
}

export function incrementPendingRequests() {
  store.dispatch(increment("pendingRequests"))
}

export function markSetupComplete() {
  store.dispatch(set("setupComplete", true))
}

export function isSetupComplete(state) {
  return get(state, "setupComplete", false)
}

export function decrementPendingRequests() {
  store.dispatch(decrement("pendingRequests"))
}

export function capitalizeFirstCharacter(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatDate(dateString) {
  if (!dateString) return dateString
  const date = new Date(dateString)
  const month = date.getMonth()
  const day = date.getDate()
  const year = date.getFullYear()
  const monthText = months[month]
  return `${monthText} ${day}, ${year}`
}

export function formatIntegrationImageUrl(integrationId) {
  return `https://storage.googleapis.com/space-cloud/assets/integrations/${integrationId}.svg`
}

export const generateToken = (state, projectId, claims) => {
  const { value, algorithm } = getJWTSecret(state, projectId)
  if (!value) return ""
  return jwt.sign(claims, value, { algorithm });
}

export function canGenerateToken(state, projectId) {
  return checkResourcePermissions(state, projectId, [configResourceTypes.PROJECT_CONFIG], "modify")
}
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
  contextTimeGraphQL: 5
})

notification.config({ placement: "topRight", top: 80 });
export const notify = (type, title, msg, duration) => {
  notification[type]({ message: title, description: String(msg), duration: duration });
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

export function openBillingPortal() {
  window.open("https://console.spaceuptech.com", "_blank")
}

export const openSecurityRulesPage = (projectId, ruleType, id, group) => {
  const url = `/mission-control/projects/${projectId}/security-rules?ruleType=${ruleType}&id=${id}${group ? `&group=${group}` : ""}`
  window.open(url, '_blank')
}

export const openProject = (projectId) => {
  const projects = get(store.getState(), "projects", [])
  // Check if the specified project exists  
  const doesExist = projects.some(project => project.id === projectId)

  if (!doesExist) {
    // Check if some other project exists. If not then redirect to the welcome page
    if (projects.length === 0) {
      history.push(`/mission-control/welcome`)
      return
    }
    projectId = projects[0].id
    notify("info", "Info", "Opened another existing project as the requested project does not exist")
  }

  localStorage.setItem("lastOpenedProject", projectId);
  const currentURL = window.location.pathname
  const projectURL = `/mission-control/projects/${projectId}/`

  // Check if the desired project is already opened.
  // This is necessary to check since the user might enter the a project url in the browser directly.
  // In that case, the exact page url (especially the module name in the url) must be preserved.
  const projectOpened = currentURL.includes(projectURL)

  // Open the project if not opened already
  if (!projectOpened) {
    history.push(projectURL)
  }

  // Load api token for the project
  loadProjectAPIToken(projectId)
}

function checkIfValueInArray(value, array = []) {
  return array.some(val => val === value)
}

// Checks if the user has permissions for a particular resource(s), verb in a project 
export function checkResourcePermissions(state, projectId, resources, verb) {
  const permissions = getPermisions(state)
  return permissions.some((permission) => {
    const projectMatched = checkIfValueInArray(permission.project, ["*", projectId])
    const resourceMatched = checkIfValueInArray(permission.resource, ["*", ...resources])
    const verbMatched = checkIfValueInArray(permission.verb, ["*", verb])
    return projectMatched && resourceMatched && verbMatched
  })
}

// Checks whether the user has a permission to open a module/section (sidenav item) within a project 
export function checkModulePermissions(state, projectId, moduleId) {
  const moduleResourcesArray = get(moduleResources, moduleId, [])

  // Return true if no permissions are required for a module
  if (moduleResourcesArray.length === 0) {
    return true
  }

  return checkResourcePermissions(state, projectId, moduleResourcesArray, "read")
}

// Performs actions to be done when an user is logged in to space cloud cluster.
// This includes loading projects and permissions.
// Note: In dev mode these actions are performed even if an user is not logged in.
export function performActionsOnAuthenticated() {
  return new Promise((resolve, reject) => {
    const promises = [loadProjects(), loadPermissions()]

    Promise.all(promises)
      .then(([projects]) => {
        if (projects.length === 0) {
          history.push(`/mission-control/welcome`)
          resolve()
          return
        }

        // Decide which project to open
        let projectToBeOpened = getProjectToBeOpened()
        if (!projectToBeOpened) {
          projectToBeOpened = localStorage.getItem("lastOpenedProject") ? localStorage.getItem("lastOpenedProject") : projects[0].id
        }

        openProject(projectToBeOpened)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

function isCurrentRoutePublic() {
  const path = window.location.pathname.split("/")[2]
  return (path === "login")
}

const getProjectToBeOpened = () => {
  let projectId = null
  const urlParams = window.location.pathname.split("/")
  if (urlParams.length > 3 && urlParams[3]) {
    projectId = urlParams[3]
  }
  return projectId
}

// Listens for cross tab logout events
const registerAuthStateListener = () => {
  window.addEventListener('storage', (event) => {
    if (event.key == 'token' && !isLoggedIn(store.getState())) {
      redirectToLogin()
    }
  })
}

const registerSecurityRulesBroadCastListener = () => {
  const bc = new BroadcastChannel('security-rules');
  bc.onmessage = ({ data }) => {
    const { rule, meta, queued } = data
    const { ruleType, id, group } = meta
    if (!queued) {
      switch (ruleType) {
        case securityRuleGroups.DB_COLLECTIONS:
          setColSecurityRule(group, id, rule)
          break;
        case securityRuleGroups.DB_PREPARED_QUERIES:
          setPreparedQueryRule(group, id, rule)
          break;
        case securityRuleGroups.EVENTING:
          setEventingSecurityRule(id, rule)
          break;
        case securityRuleGroups.FILESTORE:
          setFileStoreSecurityRule(id, rule)
          break;
        case securityRuleGroups.REMOTE_SERVICES:
          setRemoteEndpointRule(group, id, rule)
          break;
        case securityRuleGroups.INGRESS_ROUTES:
          setIngressRouteRule(id, rule)
          break
      }
    }
    notify("success", "Success", queued ? actionQueuedMessage : "Saved security rules successfully")
  }
  window.addEventListener("beforeunload", (ev) => bc.close());
}

export function redirectToLogin() {
  let loginURL = getLoginURL(store.getState())

  if (!loginURL.startsWith("http")) {
    loginURL = window.location.origin + loginURL
  }

  if (window.location.href !== loginURL) {
    window.location.href = loginURL
  }
}

// This function performs the setup required to operate mission control.
// It includes loading the space cloud environment, refreshing tokens, fetching all the necessary resources etc.
// Its intended to be called whenever the mission control is (re)loaded.
export function performSetup() {
  return new Promise((resolve, reject) => {

    // Load cluster environment and refresh token (if present) parallely
    const promises = [loadClusterEnv(), refreshClusterTokenIfPresent()]

    Promise.all(promises)
      .then(() => {

        // NOTE: loggedIn is always true in case of dev environment 
        const loggedIn = isLoggedIn(store.getState())

        // If the user is not logged in, redirect to the login url
        if (!loggedIn) {
          redirectToLogin()
          resolve()
          return
        }

        // This loads all the private resources i.e. resources that require a valid token in case of prod mode
        performActionsOnAuthenticated()
          .then(() => resolve())
          .catch(ex => reject(ex))
      })
      .catch((ex) => {
        notify("error", "Error loading environment", ex)
        reject(ex)
      })

    setInterval(() => {
      // Refresh admin token periodically (every 15 minutes)  
      refreshClusterTokenIfPresent()
        .then(() => {
          // NOTE: loggedIn is always true in case of dev environment 
          const loggedIn = isLoggedIn(store.getState())

          // If the user is not logged in, redirect to the login url
          if (!loggedIn) {
            redirectToLogin()
            resolve()
            return
          }
        })

      // Refresh admin token periodically (every 15 minutes)
      const { projectId } = extractPathInfo(history.location.pathname)
      loadProjectAPIToken(projectId)
    }, 15 * 60 * 1000)

    // Register the broadcast listener to listen to changes in security rules from security rule builder(s) opened in another tabs 
    registerSecurityRulesBroadCastListener()

    // Register cross tab logout listener
    registerAuthStateListener()
  })
}

// This function extracts the project id and the module name from the path
function extractPathInfo(path) {
  if (!path) {
    return { projectId: "", moduleId: "" }
  }

  const pathValues = path.split("/")
  if (pathValues.length < 4) {
    return { projectId: "", moduleId: "" }
  }

  return { projectId: pathValues[3], moduleId: pathValues[4] ? pathValues[4] : "overview" }
}

function usePagePermissions() {
  const history = useHistory()
  const isPrivate = !isCurrentRoutePublic()
  const loggedIn = useSelector(state => isLoggedIn(state))
  const loginURL = useSelector(state => getLoginURL(state))
  const { projectId, moduleId } = extractPathInfo(history.location.pathname)
  const hasPermissions = useSelector(state => checkModulePermissions(state, projectId, moduleId))

  // Redirect to login page if user is not logged in while accessing a private route
  if (isPrivate && !loggedIn) {
    return { allowed: false, redirectUrl: loginURL }
  }

  // Redirect to NoPermissions page if the user doesn't have permissions to view a particular path
  if (!hasPermissions) {
    // If the NoPermissions page is already opened, then pick the moduleId from the query string 
    const queryParams = qs.parse(history.location.search, { ignoreQueryPrefix: true })
    const adjustedModuleId = moduleId === "no-permissions" ? queryParams.moduleId : moduleId
    return { allowed: false, redirectUrl: `/mission-control/projects/${projectId}/no-permissions?moduleId=${adjustedModuleId}` }
  }

  return { allowed: true }
}

export function lazyWithPreload(factory) {
  const Component = React.lazy(factory);
  Component.preload = factory;
  return Component;
}

export const PrivateRoute = ({ component: Component, ...rest }) => {

  const { allowed, redirectUrl } = usePagePermissions()
  return (
    <Route
      {...rest}
      render={
        props => {
          // Redirect to login page if user is not logged in while accessing a private route
          if (!allowed) {
            return (
              <Redirect to={redirectUrl} />
            )
          }

          return (
            <Component {...props} />
          )
        }
      }
    />
  )
}

// This component redirects to the empty state page of a database if a database is not found in config
export const DatabasePageRoute = ({ component: Component, ...rest }) => {

  const { allowed, redirectUrl } = usePagePermissions()
  const dbConfig = useSelector(state => getDbConfigs(state))
  const dbAliasNames = Object.keys(dbConfig)
  const { projectID, selectedDB } = get(rest, "computedMatch.params", {})
  const isDbInConfig = dbConfig[selectedDB] ? true : false

  return (
    <Route
      {...rest}
      render={
        props => {
          // Redirect to login page if user is not logged in while accessing a private route
          if (!allowed) {
            return (
              <Redirect to={redirectUrl} />
            )
          }

          if (dbAliasNames.length === 0) {
            return (
              <Redirect to={`/mission-control/projects/${projectID}/database`} />
            )
          }

          if (!isDbInConfig) {
            return (
              <Redirect to={`/mission-control/projects/${projectID}/database/${dbAliasNames[0]}`} />
            )
          }

          return (
            <Component {...props} />
          )
        }
      }
    />
  )
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

export const dbIcons = (selectedDb) => {
  const dbType = getDbType(store.getState(), selectedDb)

  var svg = mongoSvg
  switch (dbType) {
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

export const setLastUsedValues = (projectId, newValue) => {

  const lastUsedValues = getLastUsedValues(projectId)
  const newLastUsedValues = { ...lastUsedValues, ...newValue }
  localStorage.setItem(`lastUsedValues:${projectId}`, JSON.stringify(newLastUsedValues))
}

export const getLastUsedValues = (projectId) => {
  const valueString = localStorage.getItem(`lastUsedValues:${projectId}`)
  return valueString ? JSON.parse(valueString) : {}
}

export const parseJSONSafely = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}
