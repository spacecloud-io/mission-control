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
import gql from 'graphql-tag';

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


export const handleConfigLogin = (token, lastProjectId) => {
  if (token) {
    client.setToken(token)
  }

  store.dispatch(increment("pendingRequests"))

  client.projects.getProjects().then(projects => {
    store.dispatch(set("projects", projects))
    if (projects.length === 0) {
      history.push(`/mission-control/welcome`)
      return
    }

    // Open last project
    if (!lastProjectId) {
      lastProjectId = projects[0].id
    }
    openProject(lastProjectId)
  }).catch(ex => notify("error", "Could not fetch config", ex))
    .finally(() => store.dispatch(decrement("pendingRequests")))
}

export const onAppLoad = () => {
  client.fetchEnv().then(({isProd, version}) => {
    const token = localStorage.getItem("token")
    localStorage.getItem("isProd", isProd.toString())
    store.dispatch(set("version", version))
    if (isProd && !token) {
      history.push("/mission-control/login")
      return
    }

    let lastProjectId = null
    const urlParams = window.location.pathname.split("/")
    if (urlParams.length > 3 && urlParams[3]) {
      lastProjectId = urlParams[3]
    }

    if (isProd && token) {
      client.refreshToken(token).then(token => {
        localStorage.setItem("token", token)
        handleConfigLogin(token, lastProjectId)
      }).catch(ex => {
        console.log("Error refreshing token: ", ex.toString())
        localStorage.removeItem("token")
        history.push("/mission-control/login")
      })
      return
    }

    handleConfigLogin(token, lastProjectId)
  })
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

export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      (localStorage.getItem("isProd") === "true" && !localStorage.getItem("token")) ? (
        <Redirect to={"/mission-control/login"} />
      ) : (
          <Component {...props} />
        )
    }
  />
)

export const getDBTypeFromAlias = (projectId, alias) => {
  const projects = get(store.getState(), "projects", [])
  return getProjectConfig(projects, projectId, `modules.crud.${alias}.type`, alias)
}

export const getType = (schema) => {
  return schema.definitions[0].name.value;
}

export const getFields = (schema, rules, index, specificField, argumentValue) => {
  var fields = []
  for (var i in schema.definitions[0].fields) {
    if (specificField === 1)
      if (schema.definitions[0].fields[i].name.value === argumentValue) {
        fields.push(schema.definitions[0].fields[i].name.value + "\n");
      }
      else
        continue;
    else
      fields.push(schema.definitions[0].fields[i].name.value + "\n");
    if (typeof (schema.definitions[0].fields[i].directives[0]) === 'undefined')
      continue;
    if (schema.definitions[0].fields[i].directives[0].name.value === "link") {
      for (var j in schema.definitions[0].fields[i].directives[0].arguments) {
        if (schema.definitions[0].fields[i].directives[0].arguments[j].name.value === 'field') {
          specificField = 1;
          argumentValue = schema.definitions[0].fields[i].directives[0].arguments[j].value.value;
        }
      }
      for (var j in index)
        if (typeof (schema.definitions[0].fields[i].type.type != 'undefined')) {
          if (schema.definitions[0].fields[i].type.type.name.value === gql(rules[index[j]]).definitions[0].name.value) {
            fields = fields.concat("{" + getFields(gql(rules[index[j]]), rules, index, specificField, argumentValue) + "}")
          }
          else continue;
        } else {
          if (schema.definitions[0].fields[i].type.name.value === gql(rules[index[j]]).definitions[0].name.value) {
            fields = fields.concat("{" + getFields(gql(rules[index[j]]), rules, index, specificField, argumentValue) + "}")
          }
          else continue;
        }
    }
  }
  return fields;
}

export const getFieldsValues = (schema, rules, index, specificField, argumentValue) => {
  var fieldsValue = []
  var nullType;                                                                      // 0 = NonNullType, 1 = NullType
  for (var i in schema.definitions[0].fields) {
    if (specificField === 1)
      if (schema.definitions[0].fields[i].name.value === argumentValue) {
        if (typeof (schema.definitions[0].fields[i].type.type) != 'undefined') {
          fieldsValue.push(`\t\t\t"${schema.definitions[0].fields[i].name.value}": "${((schema.definitions[0].fields[i].type.type.name.value))}"\n`);
          nullType = 1;
        }
        else {
          fieldsValue.push(`\t\t\t"${schema.definitions[0].fields[i].name.value}": "${((schema.definitions[0].fields[i].type.name.value))}"\n`);
          nullType = 0;
        }
      }
      else continue;
    else {
      if (typeof (schema.definitions[0].fields[i].type.type) != 'undefined') {
        fieldsValue.push(`\t\t\t"${schema.definitions[0].fields[i].name.value}": "${((schema.definitions[0].fields[i].type.type.name.value))}"\n`);
        nullType = 1;
      }
      else {
        fieldsValue.push(`\t\t\t"${schema.definitions[0].fields[i].name.value}": "${((schema.definitions[0].fields[i].type.name.value))}"\n`);
        nullType = 0;
      }
    }
    if (typeof (schema.definitions[0].fields[i].directives[0]) === 'undefined')
      continue;
    if (schema.definitions[0].fields[i].directives[0].name.value === "link") {
      for (var j in schema.definitions[0].fields[i].directives[0].arguments) {
        if (schema.definitions[0].fields[i].directives[0].arguments[j].name.value === 'field') {
          specificField = 1;
          argumentValue = schema.definitions[0].fields[i].directives[0].arguments[j].value.value;
        }
      }
      for (var j in index)
        if (nullType === 1)
          if (schema.definitions[0].fields[i].type.type.name.value === gql(rules[index[j]]).definitions[0].name.value) {
            fieldsValue.pop();
            fieldsValue.push(`\t\t\t"${schema.definitions[0].fields[i].name.value}": `);
            fieldsValue = fieldsValue.concat("{" + getFieldsValues(gql(rules[index[j]]), rules, index, specificField, argumentValue) + "}")
          }
          else continue;
        else
          if (schema.definitions[0].fields[i].type.name.value === gql(rules[index[j]]).definitions[0].name.value) {
            fieldsValue.pop();
            fieldsValue.push(`\t\t\t"${schema.definitions[0].fields[i].name.value}": `);
            fieldsValue = fieldsValue.concat("{" + getFieldsValues(gql(rules[index[j]]), rules, index, specificField, argumentValue) + "}")
          }
          else continue;
    }
  }
  return fieldsValue;
}


export const getVariables = (schema, rules, index) => {
  var fieldsValue = []
  var nullType;                                                                      // 0 = NonNullType, 1 = NullType
  for (var i in schema.definitions[0].fields) {
    if (typeof (schema.definitions[0].fields[i].type.type) != 'undefined') {
      fieldsValue.push(`\t\t\t${schema.definitions[0].fields[i].name.value}: "${((schema.definitions[0].fields[i].type.type.name.value))}"\n`);
      nullType = 1;
    }
    else {
      fieldsValue.push(`\t\t\t${schema.definitions[0].fields[i].name.value}: "${((schema.definitions[0].fields[i].type.name.value))}"\n`);
      nullType = 0;
    }
    if (typeof (schema.definitions[0].fields[i].directives[0]) === 'undefined')
      continue;
    if (schema.definitions[0].fields[i].directives[0].name.value === "link") {
      for (var j in index)
        if (nullType === 0)
          if (schema.definitions[0].fields[i].type.type.name.value === gql(rules[index[j]]).definitions[0].name.value) {
            fieldsValue.pop();
            fieldsValue.push(`\t\t\t${schema.definitions[0].fields[i].name.value}: `);
            fieldsValue = fieldsValue.concat("{" + getVariables(gql(rules[index[j]]), rules, index) + "}")
          }
          else
            if (schema.definitions[0].fields[i].type.name.value === gql(rules[index[j]]).definitions[0].name.value) {
              fieldsValue.pop();
              fieldsValue.push(`\t\t\t${schema.definitions[0].fields[i].name.value}: `);
              fieldsValue = fieldsValue.concat("{" + getVariables(gql(rules[index[j]]), rules, index) + "}")
            }
            else continue;
    }
  }
  return fieldsValue;
}

