import { set, get } from "automate-redux";
import client from "../client";
import store from "../store";
import { upsertArray, checkResourcePermissions } from "../utils";
import { configResourceTypes, permissionVerbs } from "../constants";

export const loadServiceRoutes = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(
      store.getState(),
      projectId,
      [configResourceTypes.SERVICE_ROUTES],
      permissionVerbs.READ
    );
    if (!hasPermission) {
      console.warn("No permission to fetch service routes");
      setServiceRoutes({});
      resolve();
      return;
    }

    client.deployments
      .fetchDeploymentRoutes(projectId)
      .then((res = []) => {
        const serviceRoutes = res.reduce((prev, curr) => {
          if (!prev[curr.id]) {
            return Object.assign({}, prev, { [curr.id]: [curr] });
          }
          const oldRoutes = prev[curr.id];
          const newRoutes = [...oldRoutes, curr];
          return Object.assign({}, prev, { [curr.id]: newRoutes });
        }, {});
        setServiceRoutes(serviceRoutes);
        resolve();
      })
      .catch((ex) => reject(ex));
  });
};

export const loadServices = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(
      store.getState(),
      projectId,
      [configResourceTypes.SERVICES],
      permissionVerbs.READ
    );
    if (!hasPermission) {
      console.warn("No permission to fetch services");
      setServices([]);
      resolve();
      return;
    }

    client.deployments
      .fetchDeployments(projectId)
      .then((deployments) => {
        setServices(deployments);
        resolve();
      })
      .catch((ex) => reject(ex));
  });
};

export const loadServicesStatus = (projectId) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(
      store.getState(),
      projectId,
      [configResourceTypes.SERVICES],
      permissionVerbs.READ
    );
    if (!hasPermission) {
      console.warn("No permission to fetch service status");
      setServicesStatus({});
      resolve();
      return;
    }

    client.deployments
      .fetchDeploymentStatus(projectId)
      .then((result) => {
        if (!result) result = [];
        const statusMap = result.reduce((prev, curr) => {
          const { serviceId, version, ...rest } = curr;
          prev = Object.assign({}, prev);
          if (!prev[serviceId]) {
            prev[serviceId] = {};
          }
          prev[serviceId][version] = rest;

          return prev;
        }, {});
        setServicesStatus(statusMap);
        resolve();
      })
      .catch((ex) => reject(ex));
  });
};

export const saveService = (projectId, serviceId, version, serviceConfig) => {
  return new Promise((resolve, reject) => {
    client.deployments
      .setDeploymentConfig(projectId, serviceId, version, serviceConfig)
      .then(({ queued }) => {
        if (!queued) {
          const services = get(store.getState(), "services", []);
          const newServices = upsertArray(
            services,
            (obj) => obj.id === serviceConfig.id && obj.version === version,
            () => serviceConfig
          );
          setServices(newServices);
        }
        resolve({ queued });
      })
      .catch((ex) => reject(ex));
  });
};

export const deleteService = (projectId, serviceId, version) => {
  return new Promise((resolve, reject) => {
    client.deployments
      .deleteDeploymentConfig(projectId, serviceId, version)
      .then(({ queued }) => {
        if (!queued) {
          const services = get(store.getState(), "services", []);
          const newServices = services.filter(
            (obj) => !(obj.id === serviceId && obj.version === version)
          );
          setServices(newServices);
        }
        resolve({ queued });
      })
      .catch((ex) => reject(ex));
  });
};

const saveServiceRoutesConfig = (projectId, serviceId, serviceRoutes) => {
  return new Promise((resolve, reject) => {
    client.deployments
      .setDeploymentRoutes(projectId, serviceId, serviceRoutes)
      .then(({ queued }) => {
        if (!queued) {
          setServiceRoute(serviceId, serviceRoutes);
        }
        resolve({ queued });
      })
      .catch((ex) => reject(ex));
  });
};

export const saveServiceRoutes = (projectId, serviceId, routeConfig) => {
  const serviceRoutes = getServiceRoutes(store.getState());
  const serviceRoute = get(serviceRoutes, serviceId, []);
  const newServiceRoutes = [
    ...serviceRoute.filter(
      (obj) => obj.source.port !== routeConfig.source.port
    ),
    routeConfig,
  ];
  return saveServiceRoutesConfig(projectId, serviceId, newServiceRoutes);
};

export const deleteServiceRoutes = (projectId, serviceId, port) => {
  const serviceRoutes = getServiceRoutes(store.getState());
  const serviceRoute = get(serviceRoutes, serviceId, []);
  const newServiceRoutes = serviceRoute.filter(
    (obj) => obj.source.port !== port
  );
  return saveServiceRoutesConfig(projectId, serviceId, newServiceRoutes);
};

// Getters
export const getServices = (state) => get(state, "services", []);
export const getUniqueServiceIDs = (state) => [
  ...new Set(getServices(state).map((obj) => obj.id)),
];
export const getServiceRoutes = (state) => get(state, "serviceRoutes", {});
export const getServicesStatus = (state) => get(state, "servicesStatus", {});
const setServiceRoutes = (serviceRoutes) =>
  store.dispatch(set("serviceRoutes", serviceRoutes));
const setServiceRoute = (serviceId, routes) =>
  store.dispatch(set(`serviceRoutes.${serviceId}`, routes));
const setServices = (services) => store.dispatch(set("services", services));
const setServicesStatus = (servicesStatus) =>
  store.dispatch(set("servicesStatus", servicesStatus));
