import { getProjectConfig, setProjectConfig } from "../utils"
import client from "../client"
import store from "../store"
import { set, get } from "automate-redux"

export const deleteProject = (projectID) => {
    return new Promise((resolve, reject) => {
        client.projects.deleteProject(projectID).then(() => {
            const extraConfig = get(store.getState(), "extraConfig", {})
            const newExtraConfig = delete extraConfig[projectID]
            store.dispatch(set(`extraConfig`, newExtraConfig))
            const projectConfig = store.getState().projects;
            const projectList = projectConfig.filter(project => project.id !== projectID)
            store.dispatch(set(`projects`, projectList))
            resolve()
        })
            .catch(ex => reject(ex))
    })
}

export const setProjectGlobal = (projectID, secret) => {
    const projectName = getProjectConfig(projectID, "name");
    return new Promise((resolve, reject) => {
        client.projects
            .setProjectGlobalConfig(projectID, {
                secret,
                id: projectID,
                name: projectName
            })
            .then(() => {
                setProjectConfig(projectID, "secret", secret);
                resolve()
            })
            .catch(ex => reject(ex))
    })
}

export const settingProjectConfig = (projectID, config, projects) => {
    return new Promise((resolve, reject) => {
        client.projects
            .setProjectConfig(projectID, config)
            .then(() => {
                const updatedProjects = projects.map(project => {
                    if (project.id === config.id) {
                        project.secret = config.secret;
                        project.modules = config.modules;
                    }
                    return project;
                });
                store.dispatch(set("projects", updatedProjects));
                resolve();
            })
            .catch(ex => reject(ex))
    })
}

export const settingConfig = (projectID, domains) => {
    return new Promise((resolve, reject) => {
        client.letsencrypt
            .setConfig(projectID, { domains: domains })
            .then(() => {
                setProjectConfig(projectID, "modules.letsencrypt.domains", domains);
                resolve();
            })
            .catch(ex => reject(ex))
    });
}
