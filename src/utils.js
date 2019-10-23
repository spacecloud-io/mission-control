import { increment, decrement, set, get } from "automate-redux"
import { notification } from "antd"
import client from "./client"
import history from "./history"
import store from "./store"
import { defaultDbConnectionStrings } from "./constants"

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

export const notify = (type, title, msg, duration) => {
  notification[type]({ message: title, description: msg, duration: duration });
}

const generateProjectId = (projectName) => {
  return projectName.toLowerCase().replace(/\s+|-/g, '_');
}

const getConnString = (dbType) => {
  const connString = defaultDbConnectionStrings[dbType]
  return connString ? connString : "localhost"
}

const defaultRules = {
  create: {
    rule: 'allow'
  },
  read: {
    rule: 'allow'
  },
  update: {
    rule: 'allow'
  },
  delete: {
    rule: 'allow'
  }
}

export const generateProjectConfig = (name, dbType) => ({
  name: name,
  id: generateProjectId(name),
  secret: generateId(),
  modules: {
    crud: {
      [dbType]: {
        enabled: true,
        conn: getConnString(dbType),
        collections: {
          default: {
            isRealtimeEnabled: true,
            rules: defaultRules
          },
          events_log: {
            isRealtimeEnabled: false,
            schema: `type events_log {
  _id: ID! @id
  batchid: String
  type: String
  token: Integer
  timestamp: Integer
  event_timestamp: Integer
  payload: String
  status: String
  retries: Integer
  service: String
  func: String              
}`,
            rules: defaultRules
          }
        }
      }
    },
    eventing: {
      enabled: true,
      dbType: dbType,
      col: "event_logs"
    },
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

export const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


export const onAppLoad = () => {
  client.fetchEnv().then(isProd => {
    const token = localStorage.getItem("token")
    if (isProd && !token) {
      history.push("/mission-control/login")
      return
    }

    let lastProjectId = null
    const urlParams = window.location.pathname.split("/")
    if (urlParams.length > 3 && urlParams[3]) {
      lastProjectId = urlParams[3]
    }

    handleConfigLogin(token, lastProjectId)
  })
}

export const createTable = (projectId, db, collectionName, rules, schema, realtimeEnabled) => {
  let collection = {
    isRealtimeEnabled: realtimeEnabled,
    rules: rules,
    schema: schema
  }
  if (db === 'mongo') {
    store.dispatch(set(`config.modules.crud.${db}.collections.${collectionName}`, collection))
    return
  }

  store.dispatch(increment("pendingRequests"))
  client.handleModifyTable(projectId, db, collectionName, schema)
    .then(() => {
      store.dispatch(set(`config.modules.crud.${db}.collections.${collectionName}`, collection))
    })
    .catch(error => {
      console.log("Error", error)
      notify("error", "Error", "Could not create table")
    })
    .finally(() => store.dispatch(decrement("pendingRequests")))
}

export const fetchCollections = (projectId) => {
  store.dispatch(increment("pendingRequests"))
  client.fetchCollectionsList(projectId)
    .then(tables => {
      store.dispatch(set(`tables.${projectId}`, tables))
    })
    .catch(error => {
      console.log("Error", error)
    })
    .finally(() => store.dispatch(decrement("pendingRequests")))
}

export const handleSetUpDb = (projectId) => {
  store.dispatch(increment("pendingRequests"))
  const crudConfig = store.getState().config.modules.crud
  const config = {}
  Object.entries(crudConfig).forEach(([dbType, dbConfig]) => {
    let collections = {}
    Object.entries(dbConfig.collections).forEach(([colName, colConfig]) => {
      collections[colName] = { schema: colConfig.schema }
    })
    config[dbType] = {
      enabled: dbConfig.enabled,
      collections: collections
    }
  })

  client.handleModify(projectId, config)
    .then(() => {
      fetchCollections(projectId)
      // notify("success", "Success", 'Successfully set up db')
    })
    .catch(error => {
      console.log("Error", error)
      notify("error", "Error", 'Could not set up db')
    })
    .finally(() => store.dispatch(decrement("pendingRequests")))
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
      default:
        source = "custom"
    }
  }
  return source
}