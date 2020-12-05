import { set, get, del } from "automate-redux";
import client from "../client";
import store from "../store";
import { defaultEventRule, configResourceTypes, permissionVerbs } from "../constants";
import { checkResourcePermissions } from "../utils";
import dotProp from "dot-prop-immutable";

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

export const loadEventingTriggers = (projectId, triggerId = "*") => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.EVENTING_TRIGGERS], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch eventing trigers")
      setEventingTriggers({})
      resolve()
      return
    }

    client.eventing.fetchEventingTriggers(projectId, triggerId)
      .then((result = []) => {
        const eventingTriggers = getEventingTriggerRules(store.getState())
        const newEventingTriggers = result.reduce((prev, curr) => {
          return dotProp.set(prev, curr.id, curr)
        }, eventingTriggers)
        setEventingTriggers(newEventingTriggers)
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

export const saveEventingConfig = (projectId, eventingConfig) => {
  return new Promise((resolve, reject) => {
    client.eventing.setEventingConfig(projectId, eventingConfig)
      .then(({ queued }) => {
        if (!queued) {
          setEventingConfig(eventingConfig)
        }
        resolve({ queued })

        // Set the default eventing rule in background
        const hasPermissionToSetEventingRule = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.EVENTING_RULES], permissionVerbs.READ)
        if (eventingConfig.enabled && hasPermissionToSetEventingRule) {
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

export const saveEventingTriggerRule = (projectId, triggerName, triggerRule) => {
  return new Promise((resolve, reject) => {
    const eventingTriggerRule = getEventingTriggerRule(store.getState(), triggerName)
    const newEventingTriggerRule = Object.assign({}, eventingTriggerRule, triggerRule)
    client.eventing.setTriggerRule(projectId, triggerName, newEventingTriggerRule)
      .then(({ queued }) => {
        if (!queued) {
          store.dispatch(set(`eventingTriggers.${triggerName}`, newEventingTriggerRule))
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
export const getEventingTriggerRule = (state, triggerId) => get(state, `eventingTriggers.${triggerId}`, {})
export const getEventingTriggerFilterRules = (state, triggerId) => get(state, `eventingTriggers.${triggerId}.filter`, {})
export const getEventingSchemas = (state) => get(state, "eventingSchemas", {})
export const getEventingSecurityRule = (state, eventType) => get(state, `eventingRules.${eventType}`, {})
export const getEventingSecurityRules = (state) => get(state, "eventingRules", {})
export const getEventingDefaultSecurityRule = (state) => get(state, "eventingRules.default", {})
export const setEventingSecurityRule = (eventType, rule) => store.dispatch(set(`eventingRules.${eventType}`, rule))
const setEventingConfig = (eventingConfig) => store.dispatch(set("eventingConfig", eventingConfig))
const setEventingRules = (eventingRules) => store.dispatch(set("eventingRules", eventingRules))
const setEventingSchemas = (eventingSchemas) => store.dispatch(set("eventingSchemas", eventingSchemas))
const setEventingTriggers = (eventingTriggers) => store.dispatch(set("eventingTriggers", eventingTriggers))