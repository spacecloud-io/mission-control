import { set, get, del } from "automate-redux";
import client from "../client";
import store from "../store";
import { defaultEventRule } from "../constants";

export const loadEventingConfig = (projectId) => {
  return new Promise((resolve, reject) => {
    client.eventing.fetchEventingConfig(projectId)
      .then((eventingConfig) => {
        store.dispatch(set("eventingConfig", eventingConfig))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadEventingSecurityRules = (projectId) => {
  return new Promise((resolve, reject) => {
    client.eventing.fetchEventingRules(projectId)
      .then((result = []) => {
        const eventingRules = result.reduce((prev, curr) => {
          const { id, ...eventingRule } = curr
          return Object.assign({}, prev, { [id]: eventingRule })
        }, {})
        store.dispatch(set("eventingRules", eventingRules))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadEventingSchemas = (projectId) => {
  return new Promise((resolve, reject) => {
    client.eventing.fetchEventingSchemas(projectId)
      .then((result = []) => {
        const eventingSchemas = result.reduce((prev, curr) => {
          const { id, schema } = curr
          return Object.assign({}, prev, { [id]: schema })
        }, {})
        store.dispatch(set("eventingSchemas", eventingSchemas))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadEventingTriggers = (projectId) => {
  return new Promise((resolve, reject) => {
    client.eventing.fetchEventingTriggers(projectId)
      .then((result = []) => {
        const eventingTriggers = result.reduce((prev, curr) => {
          return Object.assign({}, prev, { [curr.name]: curr })
        }, {})
        store.dispatch(set("eventingTriggers", eventingTriggers))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setEventingSecurityRule = (projectId, eventType, securityRule) => {
  return new Promise((resolve, reject) => {
    client.eventing.setSecurityRule(projectId, eventType, securityRule)
      .then(() => {
        store.dispatch(set(`eventingRules.${eventType}`, securityRule))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteEventingSecurityRule = (projectId, eventType) => {
  return new Promise((resolve, reject) => {
    client.eventing.deleteSecurityRule(projectId, eventType)
      .then(() => {
        store.dispatch(del(`eventingRules.${eventType}`))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setEventingSchema = (projectId, eventType, schema) => {
  return new Promise((resolve, reject) => {
    client.eventing.setEventSchema(projectId, eventType, schema)
      .then(() => {
        store.dispatch(set(`eventingSchemas.${eventType}`, schema))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteEventingSchema = (projectId, eventType) => {
  return new Promise((resolve, reject) => {
    client.eventing.deleteEventSchema(projectId, eventType)
      .then(() => {
        store.dispatch(del(`eventingSchemas.${eventType}`))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const setEventingConfig = (projectId, enabled, dbAliasName) => {
  return new Promise((resolve, reject) => {
    const eventingConfig = { enabled, dbAlias: dbAliasName }
    client.eventing.setEventingConfig(projectId, eventingConfig)
      .then(() => {
        store.dispatch(set("eventingConfig", eventingConfig))
        resolve()

        // Set the default eventing rule in background
        if (enabled) {
          const defaultEventingSecurityRule = get(store.getState(), "eventingRules.default", {})
          const defaultEventingSecurityRuleExists = Object.keys(defaultEventingSecurityRule).length > 0
          if (!defaultEventingSecurityRuleExists) {
            setEventingSecurityRule(projectId, "default", defaultEventRule)
              .catch(ex => console.error("Error setting default eventing rule while setting eventing config" + ex.toString()))
          }
        }
      })
      .catch(ex => reject(ex))
  })
}

export const setEventingTriggerRule = (projectId, triggerName, type, url, retries, timeout, options) => {
  const triggerRule = { type, url, retries, timeout, options }
  return new Promise((resolve, reject) => {
    client.eventing.setTriggerRule(projectId, triggerName, triggerRule)
      .then(() => {
        store.dispatch(set(`eventingTriggers.${triggerName}`, triggerRule))
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const deleteEventingTriggerRule = (projectId, triggerName) => {
  return new Promise((resolve, reject) => {
    client.eventing.deleteTriggerRule(projectId, triggerName)
      .then(() => {
        store.dispatch(del(`eventingTriggers.${triggerName}`))
        resolve()
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


