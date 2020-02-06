import { getProjectConfig, setProjectConfig, notify } from "../utils"
import client from "../client"

export const handleSubmit = (type, values, projectID, deployments) => {
    return new Promise((resolve, reject) => {
        let config = {
            id: values.id,
            projectId: projectID,
            version: "v1",
            scale: {
                replicas: 0,
                minReplicas: values.min,
                maxReplicas: values.max,
                concurrency: values.concurrency
            },
            tasks: [
                {
                    id: values.id,
                    ports: values.ports.map(obj =>
                        Object.assign(obj, { name: obj.protocol })
                    ),
                    resources: {
                        cpu: values.cpu * 1000,
                        memory: values.memory
                    },
                    docker: {
                        image: values.dockerImage,
                        secret: values.dockerSecret
                    },
                    secrets: values.secrets,
                    env: values.env
                        ? values.env.reduce((prev, curr) => {
                            return Object.assign({}, prev, { [curr.key]: curr.value });
                        }, {})
                        : {},
                    runtime: values.serviceType
                }
            ],
            whitelists: values.whitelists,
            upstreams: values.upstreams
        };
        client.deployments
            .setDeploymentConfig(config)
            .then(() => {
                if (type === "add") {
                    const newDeployments = [...deployments, config];
                    setProjectConfig(
                        projectID,
                        "modules.deployments.services",
                        newDeployments
                    );
                } else {
                    const newDeployments = deployments.map(obj => {
                        if (obj.id === config.id) return config;
                        return obj;
                    });
                    setProjectConfig(
                        projectID,
                        "modules.deployments.services",
                        newDeployments
                    );
                }
                resolve();
            })
            .catch(ex => reject(ex))
    });
};

export const handleDelete = (serviceId, projectID, deployments) => {
    client.deployments
        .deleteDeploymentConfig(projectID, serviceId, "v1")
        .then(() => {
            const newDeployments = deployments.filter(obj => obj.id !== serviceId);
            setProjectConfig(
                projectID,
                "modules.deployments.services",
                newDeployments
            );
            notify("success", "Success", "Successfully deleted deployment config");
        })
        .catch(ex => notify("error", "Error deleting deployment", ex))
};
