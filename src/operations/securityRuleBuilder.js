import { loadDbConfig, loadDbSchemas, loadDbRules, loadDbPreparedQueries, getCollectionSecurityRule, getPreparedQuerySecurityRule, saveColSecurityRules, savePreparedQuerySecurityRule } from "./database"
import { securityRuleGroups } from "../constants"
import { loadEventingSecurityRules, getEventingSecurityRule, saveEventingSecurityRule } from "./eventing"
import { loadFileStoreRules, getFileStoreSecurityRule, saveFileStoreSecurityRule } from "./fileStore"
import { loadRemoteServices, getRemoteEndpointSecurityRule, saveRemoteServiceEndpointRule } from "./remoteServices"
import { loadIngressRoutes, getIngressRouteSecurityRule, getIngressRouteURL, saveIngressRouteRule } from "./ingressRoutes"

export const loadSecurityRules = (projectId, ruleType) => {
  const promises = [loadDbConfig(projectId), loadDbSchemas(projectId), loadDbRules(projectId)]

  switch (ruleType) {
    case securityRuleGroups.DB_PREPARED_QUERIES:
      promises.push(loadDbPreparedQueries(projectId))
      break;
    case securityRuleGroups.EVENTING:
      promises.push(loadEventingSecurityRules(projectId))
      break;
    case securityRuleGroups.FILESTORE:
      promises.push(loadFileStoreRules(projectId))
      break;
    case securityRuleGroups.REMOTE_SERVICES:
      promises.push(loadRemoteServices(projectId))
      break;
    case securityRuleGroups.INGRESS_ROUTES:
      promises.push(loadIngressRoutes(projectId))
      break;
  }

  return Promise.all(promises)
}

export const getSecurityRuleInfo = (state, ruleType, id, group) => {
  switch (ruleType) {
    case securityRuleGroups.DB_COLLECTIONS:
      return { rule: getCollectionSecurityRule(state, group, id), name: id }
    case securityRuleGroups.DB_PREPARED_QUERIES:
      return { rule: getPreparedQuerySecurityRule(state, group, id), name: id }
    case securityRuleGroups.FILESTORE:
      return { rule: getFileStoreSecurityRule(state, id), name: id }
    case securityRuleGroups.EVENTING:
      return { rule: getEventingSecurityRule(state, id), name: id }
    case securityRuleGroups.REMOTE_SERVICES:
      return { rule: getRemoteEndpointSecurityRule(state, group, id), name: id }
    case securityRuleGroups.INGRESS_ROUTES:
      const ingressSecurityRule = getIngressRouteSecurityRule(state, id)
      const url = getIngressRouteURL(state, id)
      return { rule: ingressSecurityRule, name: url }
    default:
      return { rule: {}, name: "" }
  }
}

export const saveSecurityRule = (projectId, ruleType, id, group, rule) => {
  return new Promise((resolve, reject) => {
    let req = {}
    switch (ruleType) {
      case securityRuleGroups.DB_COLLECTIONS:
        req = saveColSecurityRules(projectId, group, id, rule)
        break
      case securityRuleGroups.DB_PREPARED_QUERIES:
        req = savePreparedQuerySecurityRule(projectId, group, id, rule)
        break
      case securityRuleGroups.FILESTORE:
        req = saveFileStoreSecurityRule(projectId, id, rule)
        break
      case securityRuleGroups.EVENTING:
        req = saveEventingSecurityRule(projectId, id, rule)
        break
      case securityRuleGroups.REMOTE_SERVICES:
        req = saveRemoteServiceEndpointRule(projectId, group, id, rule)
        break
      case securityRuleGroups.INGRESS_ROUTES:
        req = saveIngressRouteRule(projectId, id, rule)
        break
    }

    req
      .then(() => {
        const bc = new BroadcastChannel('security-rules');
        const message = {
          rule: rule,
          projectId: projectId,
          meta: { ruleType, id, group }
        }

        // Notify the parent tab
        bc.postMessage(message)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}