import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs, defaultEventRule } from "../../constants";
import { set, get } from "automate-redux";

export const saveSecurityRule = (projectId, eventType, securityRule) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    scClient.postJSON(`/v1/config/projects/${projectId}/eventing/rules/${eventType}`, { ...securityRule, id: eventType })
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202;
        if (!queued) {
          dispatch(set(`eventingRules.${eventType}`, securityRule))
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const saveEventingConfig = (projectId, enabled, dbAliasName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const eventingConfig = { enabled, dbAlias: dbAliasName }
    scClient.postJSON(`/v1/config/projects/${projectId}/eventing/config/eventing-config`, eventingConfig)
      .then(({ status, data }) => {
        if (status < 200 || status >= 300) {
          reject(data.error)
          return
        }
        const queued = status === 202;
        if (!queued) {
          dispatch(set("eventingConfig", eventingConfig))
        }
        resolve({ queued })

        // Set the default eventing rule in background
        const hasPermissionToSetEventingRule = checkResourcePermissions(getState(), projectId, [configResourceTypes.EVENTING_RULES], permissionVerbs.READ)
        if (enabled && hasPermissionToSetEventingRule) {
          const defaultEventingSecurityRule = get(getState(), "eventingRules.default", {})
          const defaultEventingSecurityRuleExists = Object.keys(defaultEventingSecurityRule).length > 0
          if (!defaultEventingSecurityRuleExists) {
            dispatch(saveSecurityRule(projectId, "default", defaultEventRule))
              .catch(ex => console.error("Error setting default eventing rule while setting eventing config" + ex.toString()))
          }
        }
      })
      .catch(ex => reject(ex.toString()))
  })
}

export const getEventingDbAliasName = (state) => get(state, "eventingConfig.dbAlias", "")