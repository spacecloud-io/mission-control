import { getProjectConfig, setProjectConfig } from "../utils"
import client from "../client"


export const createDeployments = (config, projectID) => {
    const deployments = getProjectConfig(
        projectID,
        "modules.deployments.services",
        []
    );

    return new Promise((resolve, reject) => {
        client.deployments
            .setDeploymentConfig(config)
            .then(() => {
                const filterDeployments = deployments.filter((data) => data.id != config.id)
                const newDeployments = [...filterDeployments, config];
                setProjectConfig(
                    projectID,
                    "modules.deployments.services",
                    newDeployments
                );
                resolve();
            })
            .catch(ex => reject(ex))
    });
}

export const deleteDeployment = (serviceId, projectID) => {
    const deployments = getProjectConfig(
        projectID,
        "modules.deployments.services",
        []
    );
    return new Promise((resolve, reject) => {
        client.deployments
            .deleteDeploymentConfig(projectID, serviceId, "v1")
            .then(() => {
                const newDeployments = deployments.filter(obj => obj.id !== serviceId);
                setProjectConfig(
                    projectID,
                    "modules.deployments.services",
                    newDeployments
                );
                resolve();
            })
            .catch(ex => reject(ex))
    })
}