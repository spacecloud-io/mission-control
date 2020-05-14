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
    case "login":
      return { data: { login: { status: 200, result: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBnbWFpbC5jb20iLCJpZCI6InNvbWUtdXNlci1pZCIsImlhdCI6MTUxNjIzOTAyMn0.pNdj5obmNuQ5nkgwLm05zhUSTUks4ZqVLXdHvyiF1oE" } } } }
    case "create_subscription":
      const subscriptionSuccessResult = { id: "sub_1234", status: "active", latest_invoice: { payment_intent: { status: "succeeded" } } }
      // const requiresActionResult = { id: "sub_1234", status: "incomplete", latest_invoice: { id: "in_1234", payment_intent: { status: "requires_action" } } }
      return { data: { create_subscription: { status: 200, result: subscriptionSuccessResult } } }
    case "create_failed_subscription":
      return { data: { create_failed_subscription: { status: 200 } } }
    case "register_cluster":
      return { data: { register_cluster: { status: 200, result: { clusterId: "some-cluster-id", clusterKey: "some-cluster-key" } } } }
    case "update_plan":
      return { data: { update_plan: { status: 200 } } }
    case "add_promotion":
      return { data: { add_promotion: { status: 200, result: { amount: 2500 } } } }
    case "billing_details":
      return { data: { billing_details: { status: 200, result: { country: "IN", card_number: "4078", card_type: "visa", card_expiry_date: "8/25", amount: 2500 } } } }
    case "plans":
      return { data: { plans: [{ product: { name: "Space Cloud - Starter Plan" }, amount: 2500, currency: "usd", quotas: { maxDatabases: 3, maxProjects: 1 } }] } }
    case "invoices":
      const invoices = [
        { id: "1", number: "inv_1234", status: "paid", amount: 2500, currency: "usd", period: { start: 1589081001203, end: 1589081001203 } }
      ]
      return { data: { invoices: { status: 200, result: invoices } } }
    case "clusters":
      return { data: { clusters: [{ id: "cluster1", name: "Cluster 1" }] } }
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
      this.get("/config/env", () => ({ isProd: false, version: "0.17.0", clusterId: "cluster1", plan: "space-cloud-open--monthly", quotas: { maxDatabases: 1, maxProjects: 1 } }));
      this.get("/config/credentials", () => ({ result: { pass: "123", user: "admin" } }));
      this.get("/config/quotas", () => respondOk());
      this.post("/config/login", () => respondOk({ token: "eyJhbGciOiJIUzI1NiJ9.ewogICJpZCI6ICIxIiwKICAicm9sZSI6ICJ1c2VyIiwKICAiZW1haWwiOiAidGVzdEBnbWFpbC5jb20iLAogICJuYW1lIjogIlRlc3QgdXNlciIKfQ.xzmkfIr_eDwgIBIgOP-eVpyACgtA8TeE03BMpx-WdQ0" }));
      this.post("/config/upgrade", () => respondOk());
      this.post("/config/renew-license", () => respondOk());

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
      this.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => respondOk());
      this.delete("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => respondOk());

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
