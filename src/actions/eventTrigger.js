import { getProjectConfig, setProjectConfig } from "../utils"
import client from "../client"

export const eventTriggerSetRule = (projectID, name, triggerRule) => {
    return new Promise((resolve, reject) => {
        client.eventing.setTriggerRule(projectID, name, triggerRule).then(() => {
            setProjectConfig(projectID, `modules.eventing.rules.${name}`, triggerRule)
            resolve()
        }).catch(ex => reject(ex))
    })
}

export const deleteRule = (projectID, name, newRules) => {
    return new Promise((resolve, reject) => {
        client.eventing.deleteTriggerRule(projectID, name).then(() => {
            setProjectConfig(projectID, `modules.eventing.rules`, newRules)
            resolve()
        }).catch(ex => reject(ex))
    })
}

export const triggerEvent = (projectID, eventBody) => {
    return new Promise((resolve, reject) => {
        client.eventing.queueEvent(projectID, eventBody).then(() => {
            resolve()
        })
            .catch(err => reject(err))
    })
}

export const setSecurityRule = (projectID, type, rule) => {
    return new Promise((resolve, reject) => {
        client.eventing.setSecurityRule(projectID, type, rule).then(() => {
            setProjectConfig(projectID, `modules.eventing.securityRules.${type}`, rule)
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const deleteSecurityRule = (projectID, type) => {
    return new Promise((resolve, reject) => {
        client.eventing.deleteSecurityRule(projectID, type).then(() => {
            let newRules = Object.assign({}, getProjectConfig(projectID, `modules.eventing.securityRules`, {}))
            delete newRules[type]
            setProjectConfig(projectID, `modules.eventing.securityRules`, newRules)
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const deleteEventSchema = (projectID, type) => {
    return new Promise((resolve, reject) => {
        client.eventing
            .deleteEventSchema(projectID, type)
            .then(() => {
                const newSchema = getProjectConfig(
                    projectID,
                    `modules.eventing.schemas`,
                    {}
                );
                delete newSchema[type];
                setProjectConfig(projectID, `modules.eventing.schemas`, newSchema);
                resolve();
            })
            .catch(ex => {
                reject(ex);
            })
    });
}

export const setEventSchema = (projectID, type, schema) => {
    return new Promise((resolve, reject) => {
        client.eventing
            .setEventSchema(projectID, type, schema)
            .then(() => {
                const oldSchemas = getProjectConfig(projectID, `modules.eventing.schemas`, {})
                const newSchemas = Object.assign({}, oldSchemas, {
                    [type]: { schema: schema }
                });
                setProjectConfig(projectID, `modules.eventing.schemas`, newSchemas);
                resolve();
            })
            .catch(ex => reject(ex))
    });
}

export const setEventingConfig = (projectID, dbType, col) => {
    return new Promise((resolve, reject) => {
        client.eventing
            .setEventingConfig(projectID, { enabled: true, dbType, col })
            .then(() => {
                setProjectConfig(projectID, "modules.eventing.dbType", dbType);
                setProjectConfig(projectID, "modules.eventing.col", col);
                resolve()
            })
            .catch(ex => reject(ex))
    })
}