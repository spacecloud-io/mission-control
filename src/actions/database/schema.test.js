import { createReduxStore } from "../../store";
import { Server, Response } from "miragejs";
import deepEqual from "deep-equal";
import { loadSchemas, saveColSchema } from './schema';

let server;

beforeEach(() => {
  server = new Server()
  server.namespace = "v1"
  server.logging = false
})
afterEach(() => {
  server.shutdown()
})

describe("load schemas", () => {
  it("should not have permissions", () => {
    const initialState = {
      dbSchemas: {},
      permissions: []
    }
    const store = createReduxStore(initialState)

    return store.dispatch(loadSchemas("MockProject1"))
      .then(() => {
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

  it("should have permissions and dbSchemas must be set", () => {
    const initialState = {
      dbSchemas: {},
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-schema',
          verb: 'read'
        }
      ]
    }
    const dbSchemas = [
      {
        "mydb-users": {
          schema: `type users {
            name: String!
          }`
        },
      }
    ]
    const expectedState = {
      dbSchemas: {
        mydb: {
          users: 'type users {\n            name: String!\n          }'
        },
      },
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-schema',
          verb: 'read'
        }
      ]
    }
    const loadSchemasEndpoint = server.get("/config/projects/:projectId/database/collections/schema/mutate", () => new Response(200, {}, { result: dbSchemas }))
    const store = createReduxStore(initialState);
    return store.dispatch(loadSchemas("MockProject1"))
      .then(() => {
        expect(loadSchemasEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)

      })
  })

  it("should fail with 500 status code and promise should throw exception", () => {
    const initialState = {
      dbSchemas: {},
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-schema',
          verb: 'read'
        }
      ]
    }
    const loadSchemasEndpoint = server.get("/config/projects/:projectId/database/collections/schema/mutate", () => new Response(500, {}, { error: "Failed with an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(loadSchemas("MockProject1"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(loadSchemasEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe("save schema", () => {
  it("should not queued and must be saved in redux state", () => {
    const initialState = {
      dbSchemas: {},
      dbCollections: {}
    }

    const schema = `type posts {
      id: ID! @primary
      title: String!
    }`

    const expectedState = {
      dbSchemas: {
        mydb: {
          posts: 'type posts {\n      id: ID! @primary\n      title: String!\n    }'
        }
      },
      dbCollections: {
        mydb: [
          'posts'
        ]
      }
    }

    const expectedRequestBody = {
      schema: "type posts {\\n      id: ID! @primary\\n      title: String!\\n    }"
    }

    const saveColSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", (_, request) => {
      const requestBody = JSON.parse(request.requestBody)
      /* expect(deepEqual(requestBody, expectedRequestBody)).toBe(true) */
      return new Response(200)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveColSchema('MockProjct1', 'mydb', 'posts', schema))
      .then(({ queued }) => {
        expect(queued).toBe(false)
        expect(saveColSchemaEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })
  
  it("should queued", () => {
    const initialState = {
      dbSchemas: {}
    }

    const schema = `type posts {
      id: ID! @primary
      title: String!
    }`

    const saveColSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", (_, request) => {
      const requestBody = JSON.parse(request.requestBody)
      /* expect(deepEqual(requestBody, expectedRequestBody)).toBe(true) */
      return new Response(202)
    })

    const store = createReduxStore(initialState);

    return store.dispatch(saveColSchema('MockProject1', 'mydb', 'posts', schema))
      .then(({queued}) => {
        expect(queued).toBe(true)
        expect(saveColSchemaEndpoint.numberOfCalls).toBe(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})