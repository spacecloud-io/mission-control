import { getProjectConfig, setProjectConfig } from "../utils"
import client from "../client"

export const setRemoteService = (projectID, name, newServiceConfig) => {
    return new Promise((resolve, reject) => {
        client.remoteServices.setServiceConfig(projectID, name, newServiceConfig).then(() => {
            setProjectConfig(projectID, `modules.services.externalServices.${name}`, newServiceConfig)
            resolve()
        }).catch(ex => reject(ex))
    })
}

export const deleteServiceConfig = (projectID, name) => {
    const services = getProjectConfig(projectID, "modules.services.externalServices", {})
    return new Promise((resolve, reject) => {
        client.remoteServices.deleteServiceConfig(projectID, name).then(() => {
            const newServices = Object.assign({}, services)
            delete newServices[name]
            setProjectConfig(projectID, "modules.services.externalServices", newServices)
            resolve()
        }).catch(ex => reject(ex))
    })
}