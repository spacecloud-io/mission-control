import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray, checkResourcePermissions, notify } from "../utils";
import { configResourceTypes, permissionVerbs, spaceCloudClusterOrigin } from "../constants";
import { getToken } from "./cluster";
import { generateId } from "space-api/dist/lib/utils";

export const loadServiceRoutes = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.SERVICE_ROUTES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch service routes")
      setServiceRoutes({})
      resolve()
      return
    }

    client.deployments.fetchDeploymentRoutes(projectId)
      .then((res = []) => {
        const serviceRoutes = res.reduce((prev, curr) => {
          if (!prev[curr.id]) {
            return Object.assign({}, prev, { [curr.id]: [curr] })
          }
          const oldRoutes = prev[curr.id]
          const newRoutes = [...oldRoutes, curr]
          return Object.assign({}, prev, { [curr.id]: newRoutes })
        }, {})
        setServiceRoutes(serviceRoutes)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadServices = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.SERVICES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch services")
      setServices([])
      resolve()
      return
    }

    client.deployments.fetchDeployments(projectId)
      .then((deployments) => {
        setServices(deployments)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadServicesStatus = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.SERVICES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch service status")
      setServicesStatus({})
      resolve()
      return
    }

    client.deployments.fetchDeploymentStatus(projectId)
      .then((result) => {
        if (!result) result = []
        const statusMap = result.reduce((prev, curr) => {
          const { serviceId, version, ...rest } = curr
          prev = Object.assign({}, prev)
          if (!prev[serviceId]) {
            prev[serviceId] = {}
          }
          prev[serviceId][version] = rest

          return prev
        }, {})
        setServicesStatus(statusMap)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const loadServiceLogs = async (projectId, task, replica) => {
  const filters = getServiceLogsFilters(store.getState())

  // Create a new subscription
  const subscriptionId = generateId()
  setServiceLogsSubscriptionId(subscriptionId)

  // Flush the existing logs
  setServiceLogs([])

  // Start the new subscription
  const token = getToken()
  const options = { headers: {} }
  if (token) options.headers.Authorization = `Bearer ${token}`
  let filterUrlParams = "";
  if (filters.since === "duration") filterUrlParams += `&since=${filters.time}${filters.unit}`
  else if (filters.since === "time") filterUrlParams += `&since-time=${filters.date.toString()}`
  if (filters.tail) filterUrlParams += `&tail=${filters.limit}`
  const logsEndpoint = `/v1/runner/${projectId}/services/logs?replicaId=${replica}&taskId=${task}&follow=true${filterUrlParams}`
  const url = spaceCloudClusterOrigin ? spaceCloudClusterOrigin + logsEndpoint : logsEndpoint
  const response = await fetch(url, options)
  const body = response.body
  const readableStream = body.getReader()
  const decoder = new TextDecoder('utf-8')

  readableStream.read().then(function processStream({ done, value }) {
    const state = store.getState()
    const currentSubscriptionId = getServiceLogsSubscriptionId(state)
    if (done) {
      if (currentSubscriptionId === subscriptionId) {
        notify("info", "Info", "Log stream closed")
      }
      return
    }

    const chunkValue = decoder.decode(value)
    const newLogs = chunkValue.split("\n")

    const logs = getServiceLogs(state)
    const updatedLogs = [...logs, ...newLogs]
    setServiceLogs(updatedLogs)

    return readableStream.read().then(processStream)
  })

  return () => readableStream.cancel()
}

export const saveService = (projectId, serviceId, version, serviceConfig) => {
  return new Promise((resolve, reject) => {
    client.deployments.setDeploymentConfig(projectId, serviceId, version, serviceConfig)
      .then(({ queued }) => {
        if (!queued) {
          const services = get(store.getState(), "services", [])
          const newServices = upsertArray(services, obj => obj.id === serviceConfig.id && obj.version === version, () => serviceConfig)
          setServices(newServices)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteService = (projectId, serviceId, version) => {
  return new Promise((resolve, reject) => {
    client.deployments.deleteDeploymentConfig(projectId, serviceId, version)
      .then(({ queued }) => {
        if (!queued) {
          const services = get(store.getState(), "services", [])
          const newServices = services.filter(obj => !(obj.id === serviceId && obj.version === version));
          setServices(newServices)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

const saveServiceRoutesConfig = (projectId, serviceId, serviceRoutes) => {
  return new Promise((resolve, reject) => {
    client.deployments.setDeploymentRoutes(projectId, serviceId, serviceRoutes)
      .then(({ queued }) => {
        if (!queued) {
          setServiceRoute(serviceId, serviceRoutes)
        }
        resolve({ queued });
      })
      .catch(ex => reject(ex))
  })
}

export const saveServiceRoutes = (projectId, serviceId, routeConfig) => {
  const serviceRoutes = getServiceRoutes(store.getState())
  const serviceRoute = get(serviceRoutes, serviceId, [])
  const newServiceRoutes = [...serviceRoute.filter(obj => obj.source.port !== routeConfig.source.port), routeConfig]
  return saveServiceRoutesConfig(projectId, serviceId, newServiceRoutes)
}

export const deleteServiceRoutes = (projectId, serviceId, port) => {
  const serviceRoutes = getServiceRoutes(store.getState())
  const serviceRoute = get(serviceRoutes, serviceId, [])
  const newServiceRoutes = serviceRoute.filter(obj => obj.source.port !== port)
  return saveServiceRoutesConfig(projectId, serviceId, newServiceRoutes)
}

export const loadServiceRoles = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(store.getState(), projectId, [configResourceTypes.SERVICE_ROlES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch service routes")
      setServiceRoles([])
      resolve()
      return
    }

    client.deployments.fetchDeploymentRoles(projectId)
      .then((res = []) => {
        setServiceRoles(res)
        resolve()
      })
      .catch(ex => reject(ex))
  })
}

export const saveServiceRoles = (projectId, serviceId, roleId, roleConfig) => {
  return new Promise((resolve, reject) => {
    client.deployments.setDeploymentRoles(projectId, serviceId, roleId, roleConfig)
      .then(({ queued }) => {
        if (!queued) {
          const serviceRoles = get(store.getState(), "serviceRoles", [])
          const newServiceRoles = upsertArray(serviceRoles, obj => obj.id === roleConfig.id, () => roleConfig)
          setServiceRoles(newServiceRoles)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

export const deleteServiceRoles = (projectId, serviceId, roleId) => {
  return new Promise((resolve, reject) => {
    client.deployments.deleteDeploymentRoles(projectId, serviceId, roleId)
      .then(({ queued }) => {
        if (!queued) {
          const serviceRoles = get(store.getState(), "serviceRoles", [])
          const newServiceRoles = serviceRoles.filter(obj => obj.id !== roleId);
          setServiceRoles(newServiceRoles)
        }
        resolve({ queued })
      })
      .catch(ex => reject(ex))
  })
}

// Getters
export const getServices = (state) => get(state, "services", [])
export const getUniqueServiceIDs = (state) => [...new Set(getServices(state).map(obj => obj.id))]
export const getServiceRoutes = (state) => get(state, "serviceRoutes", {})
export const getServicesStatus = (state) => get(state, "servicesStatus", {})
export const getServiceLogs = (state) => get(state, "serviceLogs", [])

export const getServiceLogsFilters = (state) => get(state, "uiState.serviceLogsFilters", {})
export const getServiceRoles = (state) => get(state, "serviceRoles", [])
const getServiceLogsSubscriptionId = (state) => get(state, "serviceLogsSubscriptionId", "")

const setServiceRoutes = (serviceRoutes) => store.dispatch(set("serviceRoutes", serviceRoutes))
const setServiceRoute = (serviceId, routes) => store.dispatch(set(`serviceRoutes.${serviceId}`, routes))
const setServices = (services) => store.dispatch(set("services", services))
const setServicesStatus = (servicesStatus) => store.dispatch(set("servicesStatus", servicesStatus))
const setServiceLogs = (logs) => store.dispatch(set("serviceLogs", logs))
const setServiceLogsSubscriptionId = (subscriptionId) => store.dispatch(set("serviceLogsSubscriptionId", subscriptionId))
const setServiceRoles = (serviceRoles) => store.dispatch(set("serviceRoles", serviceRoles))
export const setServiceLogsFilters = (filters) => store.dispatch(set("uiState.serviceLogsFilters", filters))