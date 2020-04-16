import { Server, Model, RestSerializer, Response, JSONAPISerializer, Serializer } from "miragejs";
import RemoteServices from "./services/remoteServices";
import UserManagement from "./services/userManagement";
import LetsEncrypt from "./services/letsencrypt";
function respondOk() {
  return new Response(200, {}, {})
}

export function makeServer({ environment = "development" } = {}) {
  let server = new Server({
    environment,

    models: {
      project: Model,
      credentials: Model,
    },

    seeds(server) {
      server.create("project", {
        "name": "Test",
        "id": "Test",
        "secrets": [
          {
            "secret": "8cdd996458124490abf166b408068fb1",
            "isPrimary": true
          }
        ],
        "aesKey": "ZDA4Y2FiNWQxNzIzNGI4MmJhNTM2YzUzZGFjNTJmOTc=",
        "contextTime": 5,
        "modules": {
          "db": {},
          "eventing": {},
          "userMan": {},
          "remoteServices": {
            "externalServices": {}
          },
          "fileStore": {
            "enabled": false,
            "rules": []
          }
        }
      })
    },

    serializers: {
      project: RestSerializer.extend({ keyForCollection() { return "result" } }),
    },

    routes() {
      this.namespace = "v1";
      this.timing = 500;

      // Global endpoints
      this.get("/config/env", () => ({ isProd: false, enterprise: false, version: "0.17.0" }));

      // Projects Endpoint
      this.get("/config/projects", (schema) => schema.projects.all());
      this.post("/config/projects/:projectId", () => respondOk());
      this.delete("/projects/:projectId", () => respondOk());
      this.delete("/config/projects/:projectId", () => respondOk());

      // Database endpoints
      this.post("/config/projects/:projectId/database/:db/config/database-config", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/mutate", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/inspect", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/collections/:colName", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => respondOk());

      // Collection endpoints
      this.get("/external/projects/:projectId/database/:dbName/list-collections", () => respondOk());
      this.post("/config/projects/:projectId/eventing/triggers/:triggerName", () => respondOk())
      this.delete("/config/projects/:projectId/eventing/triggers/:triggerName", () => respondOk())

      // Eventing endpoints
      this.post("/config/projects/:projectId/eventing/config/eventing-config", () => respondOk());
      this.post("/config/projects/:projectId/eventing/rules/:type", () => respondOk());
      this.post("/config/projects/:projectId/eventing/schema/:type", () => respondOk());
      this.post("/api/:projectId/graphql", () => respondOk());
      this.delete("/config/projects/:projectId/eventing/rules/:type", () => respondOk());
      this.delete("/config/projects/:projectId/eventing/schema/:type", () => respondOk());
     
      // Service endpoints
      this.get("/config/credentials", () => ({ "result": { "pass": "123", "user": "admin" }}));
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
      this.get("/runner/:projectId/service-routes", () => respondOk());   
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
