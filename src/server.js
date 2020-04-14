import { Server, Model, Factory } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  let server = new Server({
    environment,

    models: {
      project: Model
    },

    // factories: {
    //   todo: Factory.extend({
    //     text(i) {
    //       return `Todo ${i + 1}`;
    //     },

    //     isDone: false
    //   })
    // },

    seeds(server) {
      // server.create("todo", { text: "Buy groceries", isDone: false });
      // server.create("todo", { text: "Walk the dog", isDone: false });
      // server.create("todo", { text: "Do laundry", isDone: false });
    },

    routes() {
      this.namespace = "v1";
      this.timing = 500;

      console.log("Routes")
      this.get("/config/env", () => {
        console.log("Here")
        return { version: "0.17.0", enterprise: false, isProd: false }
      })

      this.get("/config/projects", schema => {
        return schema.projects.all();
      });


      this.patch("/todos/:id", (schema, request) => {
        let attrs = JSON.parse(request.requestBody).todo;

        return schema.todos.find(request.params.id).update(attrs);
      });

      this.post("/config/projects/:id", (schema, request) => {
        const projectConfig = JSON.parse(request.requestBody);
        console.log("Mirage Post Project", projectConfig, request.params.id)

        return schema.projects.create(projectConfig);
      });

      // this.delete("/config/projects/:id", (schema, request) => {
      //   return schema.todos.find(request.params.id).destroy();
      // });
    }
  });

  return server;
}
