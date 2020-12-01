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
      return { data: { event_logs: fixtures.eventLogs } }
    case "integrations":
      return { data: { integrations: fixtures.supportedInterations.map(obj => ({ config: obj })) } }
    default:
      return { data: {} }
  }
}

export function makeServer({ environment = "development" } = {}) {
  let server = new Server({
    environment,

    routes() {
      this.namespace = "v1";
      this.timing = 500;

      // Global endpoints
      this.get("/config/env", () => ({ isProd: false, loginURL: "/mission-control/login", version: "0.19.0", clusterName: "Cluster 1", plan: "space-cloud-pro--monthly-inr", licenseKey: "lic_21kj9kms8msls9", licenseMode: "offline", sessionId: "fb2e77d.47a0479900504cb3ab4a1f626d174d2djimHalpert1", nextRenewal: "2020-04-19T08:45:57Z", quotas: { maxDatabases: 4, maxProjects: 3, integrationLevel: 2 } }));
      this.get("/config/permissions", () => respondOk({ result: fixtures.permissions }));
      this.post("/config/login", () => respondOk({ token: "eyJhbGciOiJIUzI1NiJ9.ewogICJpZCI6ICIxIiwKICAicm9sZSI6ICJ1c2VyIiwKICAiZW1haWwiOiAidGVzdEBnbWFpbC5jb20iLAogICJuYW1lIjogIlRlc3QgdXNlciIKfQ.xzmkfIr_eDwgIBIgOP-eVpyACgtA8TeE03BMpx-WdQ0" }));
      this.get("/config/refresh-token", () => respondOk({ token: "eyJhbGciOiJIUzI1NiJ9.ewogICJpZCI6ICIxIiwKICAicm9sZSI6ICJ1c2VyIiwKICAiZW1haWwiOiAidGVzdEBnbWFpbC5jb20iLAogICJuYW1lIjogIlRlc3QgdXNlciIKfQ.xzmkfIr_eDwgIBIgOP-eVpyACgtA8TeE03BMpx-WdQ0" }));
      this.post("/config/projects/:projectId/generate-internal-token", () => respondOk({ token: "eyJhbGciOiJIUzI1NiJ9.ewogICJpZCI6ICIxIiwKICAicm9sZSI6ICJ1c2VyIiwKICAiZW1haWwiOiAidGVzdEBnbWFpbC5jb20iLAogICJuYW1lIjogIlRlc3QgdXNlciIKfQ.xzmkfIr_eDwgIBIgOP-eVpyACgtA8TeE03BMpx-WdQ0" }));
      this.post("/config/upgrade", () => respondOk());
      this.post("/config/offline-license", () => respondOk());
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
      this.get("/config/projects/:projectId/database/:dbName/collections/:colName/schema/track", () => respondOk({ result: "type users{ id: ID! @primary email: ID! name: String! pass: String! role: String! newField: String! }" }));
      this.delete("/config/projects/:projectId/database/:dbName/collections/:colName/schema/untrack", () => respondOk());
      this.post("/config/projects/:projectId/database/:dbName/schema/inspect", () => respondOk());
      this.get("/external/projects/:projectId/database/:dbName/list-collections", () => respondOk({ result: [] }));
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

      // Cache endpoints
      this.get("/config/caching/config", () => respondOk({ result: fixtures.cacheConfig }))
      this.get("/external/caching/connection-state", () => respondOk({ result: true }))
      this.post("/config/caching/config/cache-config", () => respondOk());
      this.delete("/external/projects/:projectId/caching/purge-cache", () => respondOk())

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
      this.get("/runner/:projectId/services/status", () => respondOk({ result: fixtures.deploymentsStatus }));
      this.get("/runner/:projectId/service-routes", () => respondOk({ result: fixtures.serviceRoutes }));
      this.post("/runner/:projectId/services/:serviceId/:version", () => respondOk());
      this.post("/runner/:projectId/service-routes/:serviceId", () => respondOk());
      this.delete("/runner/:projectId/services/:serviceId/:version", () => respondOk());
      this.get("/runner/:projectId/service-roles", () => respondOk({ result: fixtures.serviceRoles }));
      this.post("/runner/:projectId/service-roles/:serviceId/:roleId", () => respondOk());
      this.delete("/runner/:projectId/service-roles/:serviceId/:roleId", () => respondOk());

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

      // Addons
      this.get("/config/add-ons/rabbitmq/rabbitmq", () => respondOk({ result: [fixtures.addonsConfig.rabbitmq] }))
      this.get("/config/add-ons/redis/redis", () => respondOk({ result: [fixtures.addonsConfig.redis] }))
      this.get("/external/add-ons/:addOnType/:addOnName/connection-state", () => respondOk({ result: true }))
      this.post("/config/add-ons/:addOnType/:addOnName", () => respondOk())

      // API endpoints 
      this.post("/api/:projectId/graphql", (schema, request) => graphQLAPIHandler(request, schema));
      this.post("/api/:projectId/eventing/queue", () => respondOk())

      this.get("/integrations/health-check", () => respondOk())
    }
  });

  return server;
}