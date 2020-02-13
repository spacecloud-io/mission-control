import { getProjectConfig, setProjectConfig } from "../utils"
import client from "../client"

export const setUserManagementConfig = (projectID, provider, config) => {
    return new Promise((resolve, reject) => {
        client.userManagement.setUserManConfig(projectID, provider, config)
            .then(() => {
                setProjectConfig(projectID, `modules.auth.${provider}`, config)
                resolve()
            })
            .catch(ex => reject(ex))
    })
}