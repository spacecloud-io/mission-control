import { Server, Model, RestSerializer, Response, ActiveModelSerializer } from "miragejs";
import { project, serviceRoute, eventLog } from './schemas' 

function respondOk() {
  return new Response(200, {}, {})
}

function checkEventLogs(body, schema) {
  if((body).includes('event_logs')) {
    return schema.eventLogs.first();
  }
}

export function makeServer({ environment = "development" } = {}) {
  let server = new Server({
    environment,

    models: {
      project: Model,
      serviceRoute: Model,
      eventLog: Model,
    },

    fixtures: {
      projects: project,
      serviceRoutes: serviceRoute,
      eventLogs: eventLog,
    },

    serializers: {
      project: RestSerializer.extend({ keyForCollection() { return "result" } }),
      serviceRoute: RestSerializer.extend({ keyForCollection() { return "result" } }),
      eventLog: ActiveModelSerializer.extend({ keyForModel() { return "data" } }),
    },

    routes() {
      this.namespace = "v1";
      this.timing = 500;

      // Global endpoints
      this.get("/config/env", () => ({ isProd: false, enterprise: false, version: "0.17.0" }));

      // Projects Endpoint
      this.get("/config/projects", (schema) => schema.projects.all());
      this.post("/config/projects/:projectId", () => respondOk());

      // Database endpoints
      this.post("/config/projects/:projectId/database/:db/config/database-config", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/mutate", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/inspect", () => respondOk());
      this.get("/external/projects/:projectId/database/:dbName/list-collections", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/collections/:colName", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => respondOk());      

      // Eventing endpoints
      this.post("/config/projects/:projectId/eventing/config/eventing-config", () => respondOk());
      this.post("/config/projects/:projectId/eventing/rules/:type", () => respondOk());
      this.post("/config/projects/:projectId/eventing/schema/:type", () => respondOk());
      this.post("/api/:projectId/graphql", (schema, request) => checkEventLogs(request.requestBody, schema));
      this.post("/config/projects/:projectId/eventing/triggers/:triggerName", () => respondOk())
      this.delete("/config/projects/:projectId/eventing/triggers/:triggerName", () => respondOk())
      this.delete("/config/projects/:projectId/eventing/rules/:type", () => respondOk());
      this.delete("/config/projects/:projectId/eventing/schema/:type", () => respondOk());
     
      // Global endpoints
      this.get("/config/credentials", () => ({ result: { pass: "123", user: "admin"}}));
      this.get("/config/quotas", () => respondOk());

      // FileStore endpoints
      this.get("/external/projects/:projectId/file-storage/connection-state", () => respondOk());
      this.post("/config/projects/:projectId/file-storage/config/file-storage-config", () => respondOk());
      this.post("/config/projects/:projectId/file-storage/rules/:ruleName", () => respondOk());      
      this.delete("/config/projects/:projectId/file-storage/rules/:ruleName", () => respondOk());      

      // RemoteServices enpoints
      this.post("/config/projects/:projectId/remote-service/service/:serviceName", () => respondOk());      
      this.delete("/config/projects/:projectId/remote-service/service/:serviceName", () => respondOk());            

      // Deployment endpoints
      this.get("/runner/:projectId/service-routes", (schema) =>  schema.serviceRoutes.all());   
      this.post("/runner/:projectId/services/:serviceId/:version", () => respondOk());      
      this.post("/runner/:projectId/service-routes/:serviceId", () => respondOk());   
      this.delete("/runner/:projectId/services/:serviceId/:version", () => respondOk());      

      // Secrets endpoint
      this.post("/runner/:projectId/secrets/:secretConfig.id", () => respondOk());   
      this.post("/runner/:projectId/secrets/:secretName/:key", () => respondOk())
      this.delete("/runner/:projectId/secrets/:secretName/:key", () => respondOk())

      // Routes endpoint
      this.post("/config/projects/:projectId/routing/ingress/:routeId", () => respondOk())
      this.delete("/config/projects/:projectId/routing/ingress/:routeId", () => respondOk())

      // UserManagement endpoints
      this.post("/config/projects/:projectId/user-management/provider/:provider", () => respondOk())

      // LetsEncrypt endpoints
      this.post("/config/projects/:projectId/letsencrypt/config/letsencrypt-config", () => respondOk())
    }
  });

  return server;
}
