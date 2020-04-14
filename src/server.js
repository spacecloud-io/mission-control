import { Server, Model, RestSerializer, Response } from "miragejs";
function respondOk() {
  return new Response(200, {}, {})
}

export function makeServer({ environment = "development" } = {}) {
  let server = new Server({
    environment,

    models: {
      project: Model
    },

    seeds(server) {

    },

    serializers: {
      project: RestSerializer.extend({ keyForCollection() { return "result" } })
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

      // Database endpoints
      this.post("/config/projects/:projectId/database/:db/config/database-config", () => respondOk());
    }
  });

  return server;
}
