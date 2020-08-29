import { createReduxStore } from "../../store";
import { Server, Response } from "miragejs";
import deepEqual from "deep-equal";
import { loadCollections, loadDbSchemas, saveColSchema, loadDbRules } from "./collections";

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

    return store.dispatch(loadDbSchemas("MockProject1"))
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
    return store.dispatch(loadDbSchemas("MockProject1"))
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
    return store.dispatch(loadDbSchemas("MockProject1"))
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

    const expectedRequestBody = { schema:
      'type posts {\n      id: ID! @primary\n      title: String!\n    }' }

    const saveColSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", (_, request) => {
      const requestBody = JSON.parse(request.requestBody)
      expect(deepEqual(requestBody, expectedRequestBody)).toBe(true)
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

describe('load rules', () => {
  it("should not have permissions", () => {
    const initialState = {
      dbRules: {},
      permissions: []
    }
    const store = createReduxStore(initialState)

    return store.dispatch(loadDbRules("MockProject1"))
      .then(() => {
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

  it("should have permissions and dbRules must be set", () => {
    const initialState = {
      dbRules: {},
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-rule',
          verb: 'read'
        }
      ]
    }
    const dbRules = [
      {
        "mydb-users": {
          isRealtimeEnabled: true,
          rules: {
            "create": {
              "rule": "and",
              "clauses": [
                {
                  "rule": "force"
                }
              ]
            },
            "read": {
              "rule": "deny"
            },
            "update": {
              "rule": "deny"
            }
          }
        }
      }
    ]
    const expectedState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {
              create: {
                rule: 'and',
                clauses: [
                  {
                    rule: 'force'
                  }
                ]
              },
              read: {
                rule: 'deny'
              },
              update: {
                rule: 'deny'
              }
            }
          }
        }
      },
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-rule',
          verb: 'read'
        }
      ]
    }
    const loadRulesEndpoint = server.get("/config/projects/:projectId/database/collections/rules", () => new Response(200, {}, {result: dbRules}))
    const store = createReduxStore(initialState);
    
    return store.dispatch(loadDbRules('MockProject1'))
      .then(() => {
        expect(loadRulesEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-rule',
          verb: 'read'
        }
      ]
    }
    const loadRulesEndpoint = server.get("/config/projects/:projectId/database/collections/rules", () => new Response(500, {}, {error: "This is an error message"}))
    const store = createReduxStore(initialState);
    return store.dispatch(loadDbRules('MockProject1'))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(loadRulesEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe('load collections', () => {
  it("should resolve", () => {
    const initialState = {
      dbCollections: {}
    }
    const expectedState = {
      dbCollections: {
        mydb: ["posts"]
      }
    }
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200, {}, { result: ["posts"] }))
    const store = createReduxStore(initialState);
    return store.dispatch(loadCollections('MockProject1', 'mydb'))
      .then(() => {
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {}
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(500, {}, {error: "This is an error message"}))
    const store = createReduxStore(initialState);
    return store.dispatch(loadCollections('MockProject1', 'mydb'))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

