import React from 'react'
import { set as setObjectPath } from "dot-prop-immutable"
import { increment, decrement, set, get } from "automate-redux"
import { notification } from "antd"
import uri from "lil-uri"
import { dbTypes, SPACE_CLOUD_USER_ID } from './constants';

import store from "./store"
import client from "./client"
import history from "./history"
import { Redirect, Route } from "react-router-dom"
import * as firebase from 'firebase/app';
import 'firebase/auth';
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

export const getJWTSecret = (state, projectId) => {
  return getProjectConfig(state.projects, projectId, "secret", "")
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
  secret: generateJWTSecret(),
  aesKey: generateAESKey(),
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
  const projects = get(store.getState(), "projects", [])
  const config = projects.find(project => project.id === projectId)
  if (!config) {
    notify("error", "Error", "Project does not exist")
    return
  }
  const currentURL = window.location.pathname
  const projectURL = `/mission-control/projects/${projectId}/`
  if (!currentURL.includes(projectURL)) {
    history.push(projectURL)
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
  enterpriseMode = (enterpriseMode === undefined || enterpriseMode === null) ? false: enterpriseMode 
  localStorage.setItem("enterprise", enterpriseMode.toString())
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
  localStorage.setItem("isEmailVerified", isEmailVerified ? "true" : "false")

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
    if (res.status) {
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

export const fetchCred = () => {
  client.clusters.getCred().then(data => {
    store.dispatch(set('cred', data))
  })
    .catch(ex => console.log(ex))
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

    if (enterprise) {
      fetchCluster()
      handleInvoices()
    }

    fetchCred()
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
  const collections = getProjectConfig(projects, projectId, `modules.crud.${dbName}.collections`, {})
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
  const directives = def.directives
  const isPrimaryField = directives.some(dir => dir.name.value === "primary")
  const hasForeignKey = directives.some(dir => dir.name.value === "foreign")
  const hasUniqueKey = directives.some(dir => dir.name.value === "unique")
  let hasForeignKeyOn = null
  if (hasForeignKey) {
    const foreignDirective = directives.find(dir => dir.name.value === "foreign")
    const tableArgument = foreignDirective.arguments.find(ar => ar.name.value === "table")
    hasForeignKeyOn = tableArgument.value.value
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
    isPrimaryField: isPrimaryField,
    hasUniqueKey: hasUniqueKey,
    hasForeignKey: hasForeignKey,
    hasForeignKeyOn: hasForeignKeyOn,
    hasNestedFields: hasNestedFields
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
  const collections = getProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections`, {})
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
  return getProjectConfig(store.getState().projects, projectId, `modules.crud.${dbName}.collections.${colName}.schema`, "")
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
  let newFields = !generateDependentNestedFields ? fields.filter(field => !(field.hasNestedFields && fields.some(f => f.hasForeignKey && f.hasForeignKeyOn === field.type))) : fields
  newFields = !generateNestedValues ? fields.filter(field => !field.hasNestedFields) : newFields
  newFields = skipForeignDirectives ? newFields.filter(field => !field.hasForeignKey) : newFields
  newFields = !generateDependentForeignKeys ? newFields.filter(field => !(field.hasForeignKey && parentTypes.some(t => t === field.hasForeignKeyOn))) : newFields
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
  const uniqueFields = fields.filter(field => field.hasUniqueKey)
  const identifyingFields = primaryFields.length ? primaryFields : uniqueFields
  const nonIdentifyingFields = fields.filter(field => !field.isPrimaryField && !field.hasUniqueKey)
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