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
import gql from 'graphql-tag';
import gqlPrettier from 'graphql-prettier';
import { format } from 'prettier-package-json';
import { LoremIpsum } from "lorem-ipsum";
import jwt from 'jsonwebtoken';

const mysqlSvg = require(`./assets/mysqlSmall.svg`)
const postgresSvg = require(`./assets/postgresSmall.svg`)
const mongoSvg = require(`./assets/mongoSmall.svg`)
const sqlserverSvg = require(`./assets/sqlserverIconSmall.svg`)
const embeddedSvg = require('./assets/embeddedSmall.svg')

const lorem = new LoremIpsum();

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
      client.clusterConfig.getConfig()
        .then(data => store.dispatch(set("clusterConfig", data)))
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
        if (couponValue > 0) couponValue = couponValue * -1 // store balance credits in redux as negative number. 
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

const getDefType = (type, isArray) => {
  isArray = isArray ? true : type.kind === "ListType"
  if (type.type) {
    return getDefType(type.type, isArray)
  }
  return { isArray, fieldType: type.name.value }
}

const getSimplifiedFieldDefinition = (def) => {
  const { isArray, fieldType } = getDefType(def.type)
  const isRequired = def.type.kind === "NonNullType" ? true : false;
  const directives = def.directives
  const isPrimaryField = directives.some(dir => dir.name.value === "primary")
  const hasForeignConstraint = directives.some(dir => dir.name.value === "foreign")
  const hasUniqueConstraint = directives.some(dir => dir.name.value === "unique")
  let hasForeignConstraintOn = null
  if (hasForeignConstraint) {
    const foreignDirective = directives.find(dir => dir.name.value === "foreign")
    const tableArgument = foreignDirective.arguments.find(ar => ar.name.value === "table")
    hasForeignConstraintOn = tableArgument.value.value
  }
  let hasNestedFields = false
  if (fieldType !== "ID" && fieldType !== "String" && fieldType !== "Integer" && fieldType !== "Float"
    && fieldType !== "Boolean" && fieldType !== "DateTime" && fieldType !== "JSON") {
    hasNestedFields = true
  }
  return {
    name: def.name.value,
    type: fieldType,
    isArray: isArray,
    isPrimary: isPrimaryField,
    hasUniqueConstraint: hasUniqueConstraint,
    hasForeignConstraint: hasForeignConstraint,
    hasForeignConstraintOn: hasForeignConstraintOn,
    hasNestedFields: hasNestedFields,
    isRequired
  }
}

// Removes all redundant commas and quotes
const removeRegex = (value, dataresponse) => {
  let removeOpeningComma = /\,(?=\s*?[\{\]])/g;
  let removeClosingComma = /\,(?=\s*?[\}\]])/g;
  let removeQuotes = /"([^"]+)":/g;
  value = value.replace(removeOpeningComma, '');
  value = value.replace(removeClosingComma, '');
  if (dataresponse) value = format(JSON.parse(value))
  else value = value.replace(removeQuotes, '$1:')
  return value
}

export const getSchemas = (projectId, dbName) => {
  const collections = getProjectConfig(store.getState().projects, projectId, `modules.db.${dbName}.collections`, {})
  let schemaDefinitions = {}
  Object.entries(collections).forEach(([_, { schema }]) => {
    if (schema) {
      const definitions = gql(schema).definitions.filter(obj => obj.kind === "ObjectTypeDefinition");
      definitions.forEach(def => {
        return schemaDefinitions[def.name.value] = def.fields
          .filter(def => def.kind === "FieldDefinition")
          .map(obj => getSimplifiedFieldDefinition(obj))
      })
    }
  })
  return schemaDefinitions
}

export const getSchema = (projectId, dbName, colName) => {
  return getProjectConfig(store.getState().projects, projectId, `modules.db.${dbName}.collections.${colName}.schema`, "")
}

// Returns nested field definitions for a type from flat schema definitions 
export const getNestedFieldDefinitions = (schemas, schemaName, parentSchemas = []) => {
  let fields = schemas[schemaName]
  if (!fields) {
    return []
  }
  fields = fields.filter(field => !field.hasNestedFields || (field.hasNestedFields && !parentSchemas.some(type => type === field.type))).map(field => {
    // If there are nested fields and there is no circular dependency in fetching the nested fields, fetch the nested fields
    if (field.hasNestedFields && !parentSchemas.some(type => type === field.type)) {
      return Object.assign({}, field, { fields: getNestedFieldDefinitions(schemas, field.type, [...parentSchemas, schemaName]) })
    }
    return Object.assign({}, field, { hasNestedFields: false })
  })

  return fields
}
const getFieldsQuery = (fields) => {
  const keys = fields.map(field => {
    if (!field.hasNestedFields) {
      return field.name + "\n"
    }
    const fieldsQuery = getFieldsQuery(field.fields)
    if (!fieldsQuery) {
      return field.name + "\n"
    }

    return field.name + " {" + getFieldsQuery(field.fields) + "}"
  })

  return keys.join(" ")
}

const generateFieldsValue = (fields, options = {}, parentTypes = []) => {
  const defaultOptions = {
    generateNestedValues: true,
    skipForeignDirectives: false,
    generateDependentNestedFields: true,
    generateDependentForeignKeys: true
  }
  const { generateNestedValues, skipForeignDirectives, generateDependentNestedFields, generateDependentForeignKeys } = Object.assign({}, defaultOptions, options)
  let newFields = !generateDependentNestedFields ? fields.filter(field => !(field.hasNestedFields && fields.some(f => f.hasForeignConstraint && f.hasForeignConstraintOn === field.type))) : fields
  newFields = !generateNestedValues ? fields.filter(field => !field.hasNestedFields) : newFields
  newFields = skipForeignDirectives ? newFields.filter(field => !field.hasForeignConstraint) : newFields
  newFields = !generateDependentForeignKeys ? newFields.filter(field => !(field.hasForeignConstraint && parentTypes.some(t => t === field.hasForeignConstraintOn))) : newFields
  return newFields.map(field => {
    if (field.hasNestedFields) {
      const value = field.isArray ? [
        generateFieldsValue(field.fields, options, [...parentTypes, field.type])
      ] : generateFieldsValue(field.fields, options, [...parentTypes, field.type])
      return { name: field.name, value: value }
    }
    return { name: field.name, value: generateRandom(field.type) }
  }).reduce((prev, curr) => Object.assign({}, prev, { [curr.name]: curr.value }), {})
}

export const generateGraphQLQueries = (projectId, dbName, colName) => {
  const queries = {
    get: { req: '', res: '' },
    insert: { req: '', res: '' },
    update: { req: '', res: '' },
    delete: { req: '', res: '' }
  }
  if (!projectId || !dbName || !colName || !getSchema(projectId, dbName, colName)) {
    return queries
  }

  const schemas = getSchemas(projectId, dbName)
  const fields = getNestedFieldDefinitions(schemas, colName)
  const primaryFields = fields.filter(field => field.isPrimaryField)
  const uniqueFields = fields.filter(field => field.hasUniqueConstraint)
  const identifyingFields = primaryFields.length ? primaryFields : uniqueFields
  const nonIdentifyingFields = fields.filter(field => !field.isPrimaryField && !field.hasUniqueConstraint)
  const whereClause = identifyingFields.reduce((prev, curr) => Object.assign({}, prev, { [curr.name]: generateRandom(curr.type) }), {})
  queries.get.req = gqlPrettier(removeRegex(`query { 
    ${colName}(where: ${JSON.stringify(whereClause)}) @${dbName} {
      ${getFieldsQuery(fields)}
    }
   }`, 0))

  queries.get.res = removeRegex(JSON.stringify({
    data: {
      [colName]: [generateFieldsValue(fields)]
    }
  }), 1)

  queries.insert.req = gqlPrettier(removeRegex(`mutation { 
    insert_${colName} (docs: [${JSON.stringify(generateFieldsValue(fields, { generateDependentNestedFields: false, generateDependentForeignKeys: false }, [colName]))}]) @${dbName} {
      status
      error
      returning
     }
    }`, 0))

  queries.insert.res = removeRegex(`{ 
    "data":{ 
      "insert_${colName}":{ 
        "status": 200,
        "returning": [
          ${JSON.stringify(generateFieldsValue(fields, { generateDependentNestedFields: false }))}
        ]
      }
     }
    }`, 1)

  // Update clause should contain non primary, non foreign key and non nested fields
  const setClause = generateFieldsValue(nonIdentifyingFields, { generateNestedValues: false, skipForeignDirectives: true })
  queries.update.req = gqlPrettier(removeRegex(`mutation { 
    update_${colName} (where: ${JSON.stringify(whereClause)}, set: ${JSON.stringify(setClause)})  @${dbName} {
      status
      error
      returning
     }
    }`, 0))

  queries.update.res = removeRegex(`{ 
      "data":{ 
        "update_${colName}":{ 
          "status": 200
        }
       }
      }`, 1)

  queries.delete.req = gqlPrettier(removeRegex(`mutation { 
    delete_${colName}${identifyingFields.length ? `(where: ${JSON.stringify(whereClause)})` : ""} @${dbName} {
      status
      error
     }
    }`, 0))

  queries.delete.res = removeRegex(`{ 
      "data":{ 
        "insert_${colName}":{ 
          "status": 200
        }
       }
      }`, 1)

  return queries
}

// Generate random values for different schema types.
const generateRandom = type => {
  switch (type) {
    case "ID":
      return generateId(6)
    case "String":
      return lorem.generateWords(2)
    case "Integer":
      return Math.ceil(Math.random() * 100)
    case "Float":
      return Number((Math.random() * 100).toFixed(2))
    case "Boolean":
      return true
    case "DateTime":
      return new Date().toISOString()
    case "JSON":
      return { foo: "bar" }
    default:
      return type
  }
}

export const parseJSONSafely = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}