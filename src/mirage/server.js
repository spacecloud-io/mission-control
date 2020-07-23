import { Server, Response } from "miragejs";
import * as fixtures from './fixtures'
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
    fixtures: fixtures,

    routes() {
      this.namespace = "v1";
      this.timing = 500;

      // Global endpoints
      this.get("/config/env", () => ({ isProd: false, version: "0.19.0", clusterName: "Cluster 1", licenseType: "Space Cloud Pro", licenseKey: "lic_21kj9kms8msls9", nextRenewal: "2020-04-19T08:45:57Z" }));
      this.get("/config/quotas", () => respondOk());
      this.post("/config/login", () => respondOk({ token: "eyJhbGciOiJIUzI1NiJ9.ewogICJpZCI6ICIxIiwKICAicm9sZSI6ICJ1c2VyIiwKICAiZW1haWwiOiAidGVzdEBnbWFpbC5jb20iLAogICJuYW1lIjogIlRlc3QgdXNlciIKfQ.xzmkfIr_eDwgIBIgOP-eVpyACgtA8TeE03BMpx-WdQ0" }));
      this.post("/config/upgrade", () => respondOk());
      this.post("/config/degrade", () => respondOk());

      // Projects Endpoint
      this.get("/config/projects/:projectId", () => respondOk({ result: fixtures.projects }));
      this.post("/config/projects/:projectId", () => respondOk());
      this.delete("/config/projects/:projectId", () => respondOk());

      // cluster Endpoint
      this.get("/config/cluster", () => respondOk({ result: fixtures.clusterConfig }));
      this.post("/config/cluster", () => respondOk());

      // Database endpoints
      this.get("/config/projects/:projectId/database/config", () => respondOk({ result: fixtures.dbConfigs }))
      this.get("/config/projects/:projectId/database/collections/schema/mutate", () => respondOk({ result: fixtures.dbSchemas }))
      this.get("/config/projects/:projectId/database/collections/rules", () => respondOk({ result: fixtures.dbRules }))
      this.get("/config/projects/:projectId/database/prepared-queries", () => respondOk({ result: fixtures.dbPreparedQueries }))
      this.get("/external/projects/:projectId/database/:dbName/connection-state", () => respondOk({ result: true }));
      this.post("/config/projects/:projectId/database/:db/config/database-config", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/mutate", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", () => respondOk());
      this.get("/config/projects/:projectId/database/:dbName/collections/:colName/schema/track", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/collections/:colName/schema/untrack", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/inspect", () => respondOk());
      this.get("/external/projects/:projectId/database/:dbName/list-collections", () => respondOk({ result: ["xyz", "abc", "users"] }));
      this.delete("/config/projects/:projectId/database/:dbName/collections/:colName", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => respondOk());

      // FileStore endpoints
      this.get("/config/projects/:projectId/file-storage/config", () => respondOk({ result: fixtures.fileStoreConfig }));
      this.get("/config/projects/:projectId/file-storage/rules", () => respondOk({ result: fixtures.fileStoreRules }));
      this.get("/external/projects/:projectId/file-storage/connection-state", () => respondOk({ result: true }));
      this.post("/config/projects/:projectId/file-storage/config/file-storage-config", () => respondOk());
      this.post("/config/projects/:projectId/file-storage/rules/:ruleName", () => respondOk());
      this.delete("/config/projects/:projectId/file-storage/rules/:ruleName", () => respondOk());

      // Eventing endpoints
      this.get("/config/projects/:projectId/eventing/config", () => respondOk({ result: fixtures.eventingConfig }))
      this.get("/config/projects/:projectId/eventing/schema", () => respondOk({ result: fixtures.eventingSchemas }))
      this.get("/config/projects/:projectId/eventing/rules", () => respondOk({ result: fixtures.eventingRules }))
      this.get("/config/projects/:projectId/eventing/triggers", () => respondOk({ result: fixtures.eventingTriggers }))
      this.post("/config/projects/:projectId/eventing/config/eventing-config", () => respondOk());
      this.post("/config/projects/:projectId/eventing/rules/:type", () => respondOk());
      this.post("/config/projects/:projectId/eventing/schema/:type", () => respondOk());
      this.post("/config/projects/:projectId/eventing/triggers/:triggerName", () => respondOk())
      this.delete("/config/projects/:projectId/eventing/triggers/:triggerName", () => respondOk())
      this.delete("/config/projects/:projectId/eventing/rules/:type", () => respondOk());
      this.delete("/config/projects/:projectId/eventing/schema/:type", () => respondOk());

      // RemoteServices enpoints
      this.get("/config/projects/:projectId/remote-service/service", () => respondOk({ result: fixtures.remoteServices }))
      this.post("/config/projects/:projectId/remote-service/service/:serviceName", () => respondOk());
      this.delete("/config/projects/:projectId/remote-service/service/:serviceName", () => respondOk());

      // Deployment endpoints
      this.get("/runner/:projectId/services", () => respondOk({ result: fixtures.services }));
      this.get("/runner/:projectId/service-routes", () => respondOk({ result: fixtures.serviceRoutes }));
      this.post("/runner/:projectId/services/:serviceId/:version", () => respondOk());
      this.post("/runner/:projectId/service-routes/:serviceId", () => respondOk());
      this.delete("/runner/:projectId/services/:serviceId/:version", () => respondOk());

      // Secrets endpoint
      this.get("/runner/:projectId/secrets", () => respondOk({ result: fixtures.secrets }));
      this.post("/runner/:projectId/secrets/:secretConfig.id", () => respondOk());
      this.post("/runner/:projectId/secrets/:secretName/:key", () => respondOk())
      this.post("/runner/:projectId/secrets/:secretName/root-path", () => respondOk())
      this.delete("/runner/:projectId/secrets/:secretName/:key", () => respondOk())
      this.delete("/runner/:projectId/secrets/:secretName", () => respondOk())

      // Routes endpoint
      this.get("/config/projects/:projectId/routing/ingress", () => respondOk({ result: fixtures.ingressRoutes }))
      this.get("/config/projects/:projectId/routing/ingress/global", () => respondOk({ result: fixtures.ingressRoutesGlobal }))
      this.post("/config/projects/:projectId/routing/ingress/global", () => respondOk())
      this.post("/config/projects/:projectId/routing/ingress/:routeId", () => respondOk())
      this.delete("/config/projects/:projectId/routing/ingress/:routeId", () => respondOk())

      // UserManagement endpoints
      this.get("/config/projects/:projectId/user-management/provider", () => respondOk({ result: fixtures.userMan }))
      this.post("/config/projects/:projectId/user-management/provider/:provider", () => respondOk())

      // LetsEncrypt endpoints
      this.get("/config/projects/:projectId/letsencrypt/config", () => respondOk({ result: fixtures.letsencryptConfig }));
      this.post("/config/projects/:projectId/letsencrypt/config/letsencrypt-config", () => respondOk())

      // Integration endpoints
      this.get("/config/integrations", () => respondOk({ result: fixtures.installedIntegrations }));
      this.post("/config/integrations", () => respondOk())
      this.delete("/config/integrations/:integrationId", () => respondOk())

      // API endpoints 
      this.post("/api/:projectId/graphql", (schema, request) => graphQLAPIHandler(request, schema));
      this.post("/api/:projectId/eventing/queue", () => respondOk())
    }
  });

  return server;
}