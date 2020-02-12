import { getProjectConfig, setProjectConfig } from "../utils"
import client from "../client"

export const setRoutingConfig = (projectID, config, routeId) => {
    let routes = getProjectConfig(projectID, "modules.routes", []);
    return new Promise((resolve, reject) => {
        client.routing
            .setRoutingConfig(projectID, config.id, config)
            .then(() => {
                if (routeId) {
                    const newRoutes = routes.map(obj => obj.id === routeId ? config : obj)
                    setProjectConfig(projectID, "modules.routes", newRoutes)
                } else {
                    const newRoutes = [...routes, config]
                    setProjectConfig(projectID, "modules.routes", newRoutes)
                }
                resolve()
            })
            .catch(ex => reject(ex))
    })
}

export const deleteRoutingConfig = (projectID, id) => {
    let routes = getProjectConfig(projectID, "modules.routes", []);
    return new Promise((resolve, reject) => {
        client.routing
            .deleteRoutingConfig(projectID, id)
            .then(() => {
                const newRoutes = routes.filter(route => route.id !== id);
                setProjectConfig(projectID, `modules.routes`, newRoutes);
                resolve()
            })
            .catch(ex => reject(ex))
    })
}