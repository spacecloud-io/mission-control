import { getProjectConfig, setProjectConfig } from "../utils"
import client from "../client"

export const addSecrets = (secretConfig, projectID) => {
    const secrets = getProjectConfig(projectID, "modules.secrets", []);
    return new Promise((resolve, reject) => {
        client.secrets
            .addSecret(projectID, secretConfig)
            .then(() => {
                const newSecrets = [...secrets.filter(obj => obj.name !== secretConfig.name), secretConfig];
                setProjectConfig(projectID, "modules.secrets", newSecrets);
                resolve();
            })
            .catch(ex => {
                reject(ex);
            })
    });
}

export const deleteSecret = (secretName, projectID) => {
    const secrets = getProjectConfig(projectID, "modules.secrets", []);
    return new Promise((resolve, reject) => {
        client.secrets
            .deleteSecret(projectID, secretName)
            .then(() => {
                const newSecrets = secrets.filter(obj => obj.name !== secretName);
                setProjectConfig(projectID, "modules.secrets", newSecrets);
                resolve();
            })
            .catch(ex => reject())
    })
}

export const setSecretKey = (key, value, projectID, secretName) => {
    const secrets = getProjectConfig(projectID, "modules.secrets", []);
    let secret = secrets.find(obj => obj.name === secretName);
    return new Promise((resolve, reject) => {
        client.secrets
            .setSecretKey(projectID, secretName, key, value)
            .then(() => {
                const newSecrets = secrets.map(obj => {
                    if (obj.name !== secretName) return obj;
                    const newData = Object.assign({}, secret.data, { [key]: value });
                    return Object.assign({}, secret, { data: newData });
                });
                setProjectConfig(projectID, "modules.secrets", newSecrets);
                resolve();
            })
            .catch(ex => reject())
    });
}

export const deleteSecretKey = (projectID, secretName, name) => {
    const secrets = getProjectConfig(projectID, "modules.secrets", []);
    let secret = secrets.find(obj => obj.name === secretName);
    return new Promise((resolve, reject) => {
        client.secrets.deleteSecretKey(projectID, secretName, name).then(() => {
            const newSecrets = secrets.map(obj => {
                if (obj.name !== secretName) return obj;
                const newData = Object.assign({}, secret.data);
                delete newData[name]
                return Object.assign({}, secret, { data: newData });
            });
            setProjectConfig(projectID, "modules.secrets", newSecrets);
            resolve();
        }).catch(ex => reject())
    })
}