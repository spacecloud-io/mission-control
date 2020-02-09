import { getProjectConfig, setProjectConfig } from "../utils"
import client from "../client"

export const fileStorageConfig = (projectID, newConfig) => {
    return new Promise((resolve, reject) => {
        client.fileStore.setConfig(projectID, newConfig).then(() => {
            const curentConfig = getProjectConfig(projectID, "modules.fileStore", {})
            setProjectConfig(projectID, "modules.fileStore", Object.assign({}, curentConfig, newConfig))
            resolve()
        })
            .catch(ex => reject(ex))

    })
}

export const saveRule = (projectID, selectedRuleName, rule) => {
    const { rules = [], ...config } = getProjectConfig(projectID, "modules.fileStore", {})
    return new Promise((resolve, reject) => {
        client.fileStore.setRule(projectID, selectedRuleName, rule).then(() => {
            const newRules = rules.map(r => {
                if (r.name !== selectedRuleName) return rule
                return Object.assign({}, r, rule)
            })
            setProjectConfig(projectID, "modules.fileStore.rules", newRules)
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const addRule = (projectID, ruleName, rule) => {
    const { rules = [], ...config } = getProjectConfig(projectID, "modules.fileStore", {})
    return new Promise((resolve, reject) => {
        client.fileStore.setRule(projectID, ruleName, rule).then(() => {
            const newRules = [...rules, { name: ruleName, ...rule }]
            setProjectConfig(projectID, "modules.fileStore.rules", newRules)
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const deleteRule = (projectID, ruleName) => {
    const { rules = [], ...config } = getProjectConfig(projectID, "modules.fileStore", {})
    return new Promise((resolve, reject) => {
        client.fileStore.deleteRule(projectID, ruleName).then(() => {
            const newRules = rules.filter(r => r.name !== ruleName)
            setProjectConfig(projectID, "modules.fileStore.rules", newRules)
            resolve()
        })
            .catch(ex => reject(ex))
    })
}
