import { set, get, del } from "automate-redux";
import client from "../client";
import store from "../store";
import { defaultEventRule, configResourceTypes, permissionVerbs } from "../constants";
import { checkResourcePermissions } from "../utils";

export const loadEventingConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.EVENTING_CONFIG], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch eventing config")
      setEventingConfig({})
      resolve()
      return
    }

    client.eventing.fetchEventingConfig(projectId)
      .then((eventingConfig) => {
        setEventingConfig(eventingConfig)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadEventingSecurityRules = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.EVENTING_RULES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch eventing rules")
      setEventingRules({})
      resolve()
      return
    }

    client.eventing.fetchEventingRules(projectId)
      .then((result = []) => {
        const eventingRules = result.reduce((prev, curr) => {
          const { id, ...eventingRule } = curr
          return Object.assign({}, prev, { [id]: eventingRule })
        }, {})
        setEventingRules(eventingRules)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadEventingSchemas = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.EVENTING_SCHEMA], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch eventing schemas")
      setEventingSchemas({})
      resolve()
      return
    }

    client.eventing.fetchEventingSchemas(projectId)
      .then((result = []) => {
        const eventingSchemas = result.reduce((prev, curr) => {
          const { id, schema } = curr
          return Object.assign({}, prev, { [id]: schema })
        }, {})
        setEventingSchemas(eventingSchemas)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadEventingTriggers = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.EVENTING_TRIGGERS], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch eventing trigers")
      setEventingTriggers({})
      resolve()
      return
    }

    client.eventing.fetchEventingTriggers(projectId)
      .then((result = []) => {
        const eventingTriggers = result.reduce((prev, curr) => {
          return Object.assign({}, prev, { [curr.id]: curr })
        }, {})
        setEventingTriggers(eventingTriggers)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveEventingSecurityRule = (projectId, eventType, securityRule) => {
  return new Promise((resolve, reject) => {
    client.eventing.setSecurityRule(projectId, eventType, securityRule)
      .then(({ queued }) => {
        if (!queued) {
          setEventingSecurityRule(eventType, securityRule)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteEventingSecurityRule = (projectId, eventType) => {
  return new Promise((resolve, reject) => {
    client.eventing.deleteSecurityRule(projectId, eventType)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(del(`eventingRules.${eventType}`))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveEventingSchema = (projectId, eventType, schema) => {
  return new Promise((resolve, reject) => {
    client.eventing.setEventSchema(projectId, eventType, schema)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`eventingSchemas.${eventType}`, schema))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteEventingSchema = (projectId, eventType) => {
  return new Promise((resolve, reject) => {
    client.eventing.deleteEventSchema(projectId, eventType)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(del(`eventingSchemas.${eventType}`))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const saveEventingConfig = (projectId, enabled, dbAliasName) => {
  return new Promise((resolve, reject) => {
    const eventingConfig = { enabled, dbAlias: dbAliasName }
    client.eventing.setEventingConfig(projectId, eventingConfig)
      .then(({ queued }) => {
        if (!queued) {
          setEventingConfig(eventingConfig)
        }
        resolve({ queued })

        // Set the default eventing rule in background
        const hasPermissionToSetEventingRule = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.EVENTING_RULES], permissionVerbs.READ)
        if (enabled && hasPermissionToSetEventingRule) {
          const defaultEventingSecurityRule = get(store.getState(), "eventingRules.default", {})
          const defaultEventingSecurityRuleExists = Object.keys(defaultEventingSecurityRule).length > 0
          if (!defaultEventingSecurityRuleExists) {
            saveEventingSecurityRule(projectId, "default", defaultEventRule)
              .catch(ex => console.error("Error setting default eventing rule while setting eventing config" + ex.toString()))
          }
        }
      })
      .catch(ex => reject(ex))
  })
}

export const saveEventingTriggerRule = (projectId, triggerName, type, url, retries, timeout, options) => {
  const triggerRule = { type, url, retries, timeout, options }
  return new Promise((resolve, reject) => {
    client.eventing.setTriggerRule(projectId, triggerName, triggerRule)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`eventingTriggers.${triggerName}`, triggerRule))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteEventingTriggerRule = (projectId, triggerName) => {
  return new Promise((resolve, reject) => {
    client.eventing.deleteTriggerRule(projectId, triggerName)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(del(`eventingTriggers.${triggerName}`))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const triggerCustomEvent = (projectId, type, payload, isSynchronous, token) => {
  return new Promise((resolve, reject) => {
    const eventBody = { type, delay: 0, timestamp: new Date().toISOString(), payload, options: {}, isSynchronous }
    client.eventing.queueEvent(projectId, eventBody, token)
      .then(data => resolve(data))
      .catch(ex => reject(ex))
  })
}


// Getters && setters

export const getEventingConfig = (state) => get(state, "eventingConfig", { enabled: false, dbAlias: "" })
export const getEventingDbAliasName = (state) => get(state, "eventingConfig.dbAlias", "")
export const getEventingTriggerRules = (state) => get(state, "eventingTriggers", {})
export const getEventingSchemas = (state) => get(state, "eventingSchemas", {})
export const getEventingSecurityRule = (state, eventType) => get(state, `eventingRules.${eventType}`, {})
export const getEventingSecurityRules = (state) => get(state, "eventingRules", {})
export const getEventingDefaultSecurityRule = (state) => get(state, "eventingRules.default", {})
export const setEventingSecurityRule = (eventType, rule) => store.dispatch(set(`eventingRules.${eventType}`, rule))
const setEventingConfig = (eventingConfig) => store.dispatch(set("eventingConfig", eventingConfig))
const setEventingRules = (eventingRules) => store.dispatch(set("eventingRules", eventingRules))
const setEventingSchemas = (eventingSchemas) => store.dispatch(set("eventingSchemas", eventingSchemas))
const setEventingTriggers = (eventingTriggers) => store.dispatch(set("eventingTriggers", eventingTriggers))