import { Server, Model, RestSerializer, Response } from "miragejs";
import fixtures from './fixtures'
import gql from "graphql-tag"

function respondOk(body = {}) {
  return new Response(200, {}, body)
}
function getRootField(ast) {
  const { definitions = [] } = ast
  if (definitions.length === 0) return ""
  const definition = definitions[0]
  const selectionSet = definition.selectionSet.selections[0]
  const { name } = selectionSet
  return name.value
}
function graphQLAPIHandler(request, schema) {
  const body = JSON.parse(request.requestBody)
  const { query } = body;
  const ast = gql(query);
  const field = getRootField(ast)
  switch (field) {
    case "event_logs":
      return { data: { event_logs: schema.db.eventLogs } }
    default:
      return { data: {} }
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

    fixtures: fixtures,

    serializers: {
      project: RestSerializer.extend({ keyForCollection() { return "result" } }),
      serviceRoute: RestSerializer.extend({ keyForCollection() { return "result" } })
    },

    routes() {
      this.namespace = "v1";
      this.timing = 500;

      // Global endpoints
      this.get("/config/env", () => ({ isProd: false, version: "0.17.0" }));
      this.get("/config/credentials", () => ({ result: { pass: "123", user: "admin" } }));
      this.get("/config/quotas", () => respondOk());
      this.post("/config/login", () => respondOk({ token: "eyJhbGciOiJIUzI1NiJ9.ewogICJpZCI6ICIxIiwKICAicm9sZSI6ICJ1c2VyIiwKICAiZW1haWwiOiAidGVzdEBnbWFpbC5jb20iLAogICJuYW1lIjogIlRlc3QgdXNlciIKfQ.xzmkfIr_eDwgIBIgOP-eVpyACgtA8TeE03BMpx-WdQ0" }));

      // Projects Endpoint
      this.get("/config/projects", (schema) => schema.projects.all());
      this.post("/config/projects/:projectId", () => respondOk());
      this.delete("/config/projects/:projectId", () => respondOk());

      // Database endpoints
      this.get("/external/projects/:projectId/database/:dbName/connection-state", () => respondOk({ result: true }));
      this.post("/config/projects/:projectId/database/:db/config/database-config", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/mutate", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/inspect", () => respondOk());
      this.get("/external/projects/:projectId/database/:dbName/list-collections", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/collections/:colName", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => respondOk());

      // FileStore endpoints
      this.get("/external/projects/:projectId/file-storage/connection-state", () => respondOk({ result: true }));
      this.post("/config/projects/:projectId/file-storage/config/file-storage-config", () => respondOk());
      this.post("/config/projects/:projectId/file-storage/rules/:ruleName", () => respondOk());
      this.delete("/config/projects/:projectId/file-storage/rules/:ruleName", () => respondOk());

      // Eventing endpoints
      this.post("/config/projects/:projectId/eventing/config/eventing-config", () => respondOk());
      this.post("/config/projects/:projectId/eventing/rules/:type", () => respondOk());
      this.post("/config/projects/:projectId/eventing/schema/:type", () => respondOk());
      this.post("/config/projects/:projectId/eventing/triggers/:triggerName", () => respondOk())
      this.delete("/config/projects/:projectId/eventing/triggers/:triggerName", () => respondOk())
      this.delete("/config/projects/:projectId/eventing/rules/:type", () => respondOk());
      this.delete("/config/projects/:projectId/eventing/schema/:type", () => respondOk());

      // RemoteServices enpoints
      this.post("/config/projects/:projectId/remote-service/service/:serviceName", () => respondOk());
      this.delete("/config/projects/:projectId/remote-service/service/:serviceName", () => respondOk());

      // Deployment endpoints
      this.get("/runner/:projectId/service-routes", (schema) => schema.serviceRoutes.all());
      this.post("/runner/:projectId/services/:serviceId/:version", () => respondOk());
      this.post("/runner/:projectId/service-routes/:serviceId", () => respondOk());
      this.delete("/runner/:projectId/services/:serviceId/:version", () => respondOk());

      // Secrets endpoint
      this.post("/runner/:projectId/secrets/:secretConfig.id", () => respondOk());
      this.post("/runner/:projectId/secrets/:secretName/:key", () => respondOk())
      this.post("/runner/:projectId/secrets/:secretName/root-path", () => respondOk())
      this.delete("/runner/:projectId/secrets/:secretName/:key", () => respondOk())
      this.delete("/runner/:projectId/secrets/:secretName", () => respondOk())

      // Routes endpoint
      this.post("/config/projects/:projectId/routing/ingress/:routeId", () => respondOk())
      this.delete("/config/projects/:projectId/routing/ingress/:routeId", () => respondOk())

      // UserManagement endpoints
      this.post("/config/projects/:projectId/user-management/provider/:provider", () => respondOk())

      // LetsEncrypt endpoints
      this.post("/config/projects/:projectId/letsencrypt/config/letsencrypt-config", () => respondOk())

      // API endpoints 
      this.post("/api/:projectId/graphql", (schema, request) => graphQLAPIHandler(request, schema));
      this.post("/api/:projectId/eventing/queue", () => respondOk())
    }
  });

  return server;
}
