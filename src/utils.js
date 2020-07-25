import React from 'react'
import { set as setObjectPath } from "dot-prop-immutable"
import { increment, decrement, set, get } from "automate-redux"
import { notification } from "antd"
import uri from "lil-uri"
import { dbTypes, SPACE_CLOUD_USER_ID, securityRuleGroups } from './constants';

import store from "./store"
import history from "./history"
import { Redirect, Route } from "react-router-dom"
import jwt from 'jsonwebtoken';
import { loadProjects, getJWTSecret } from './operations/projects'
import { getDbType, setPreparedQueryRule, setColSecurityRule } from './operations/database'
import { setRemoteEndpointRule } from './operations/remoteServices'
import { setIngressRouteRule } from './operations/ingressRoutes'
import { setEventingSecurityRule } from './operations/eventing'
import { setFileStoreSecurityRule } from './operations/fileStore'
import { loadClusterEnv, isProdMode, getToken, refreshClusterTokenIfNeeded } from './operations/cluster'

const mysqlSvg = require(`./assets/mysqlSmall.svg`)
const postgresSvg = require(`./assets/postgresSmall.svg`)
const mongoSvg = require(`./assets/mongoSmall.svg`)
const sqlserverSvg = require(`./assets/sqlserverIconSmall.svg`)
const embeddedSvg = require('./assets/embeddedSmall.svg')

const months = ["Jan", "Feb", "March", "April", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function copyObjectToClipboard(obj) {
  return navigator.clipboard.writeText(JSON.stringify(obj))
}

export function getCopiedObjectFromClipboard() {
  return new Promise((resolve, reject) => {
    navigator.clipboard.readText()
      .then(data => {
        const isValueJson = isJson(data)
        if (!isValueJson) {
          reject("Copied object is not a valid JSON")
          return
        }
        resolve(JSON.parse(data))
      })
      .catch(ex => reject(ex))
  })
}

export function upsertArray(array, predicate, getItem) {
  const index = array.findIndex(predicate)
  return index === -1 ? [...array, getItem()] : [...array.slice(0, index), getItem(array[index]), ...array.slice(index + 1)]
}

export function incrementPendingRequests() {
  store.dispatch(increment("pendingRequests"))
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
  return `https://storage.googleapis.com/space-cloud/assets/${integrationId}.svg`
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
  window.open("https://billing.spaceuptech.com", "_blank")
}

export const openSecurityRulesPage = (projectId, ruleType, id, group) => {
  const url = `/mission-control/projects/${projectId}/security-rules/editor?ruleType=${ruleType}&id=${id}${group ? `&group=${group}` : ""}`
  window.open(url, '_blank')
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

// Performs actions to be done when an user is logged in to space cloud cluster
// Note: In dev mode these actions are performed even if an user is not logged in
export function performActionsOnAuthenticated() {
  incrementPendingRequests()
  loadProjects()
    .then(projects => {
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
    })
    .catch(ex => notify("error", "Could not fetch projects", ex))
    .finally(() => decrementPendingRequests())
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

  const productionMode = isProdMode()
  const token = getToken()

  if (productionMode && !token) {
    return { redirect: true, redirectUrl: "/mission-control/login" }
  }

  return { redirect: false, redirectUrl: "" }
}

export function redirectIfNeeded() {
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

const registerSecurityRulesBroadCastListener = () => {
  const bc = new BroadcastChannel('security-rules');
  bc.onmessage = ({ data }) => {
    const { rule, meta } = data
    const { ruleType, id, group } = meta
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
    notify("success", "Success", "Saved security rules successfully")
  }
  window.addEventListener("beforeunload", (ev) => bc.close());
}

export const onAppLoad = () => {
  loadClusterEnv()
    .then(() => {
      refreshClusterTokenIfNeeded()
        .then((tokenRefreshed) => {
          redirectIfNeeded()
          // Note: In case of dev mode tokenRefreshed will always be true
          if (tokenRefreshed) {
            performActionsOnAuthenticated()
          }
        })
        .catch(ex => {
          notify("error", "Error refreshing token", ex)
          redirectIfNeeded()
        })

      setInterval(() => {
        refreshClusterTokenIfNeeded().finally(() => redirectIfNeeded())
      }, 15 * 60 * 1000)

      registerSecurityRulesBroadCastListener()
    })
    .catch((ex) => notify("error", "Error fetching cluster environment", ex))
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

export const parseJSONSafely = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}