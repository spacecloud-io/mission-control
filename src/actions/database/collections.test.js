import { createReduxStore } from "../../store";
import { Server, Response } from "miragejs";
import deepEqual from "deep-equal";
import { loadCollections, loadDbSchemas, saveColSchema, inspectColSchema, loadDbRules, modifyDbSchema, saveColRule, saveColRealtimeEnabled, untrackCollection, deleteCollection } from "./collections";

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

  it("should have permissions", () => {
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

  it("should reject with 500 status code", () => {
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
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(loadSchemasEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe("save schema", () => {
  it("should not queued", () => {
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
      schema:
        'type posts {\n      id: ID! @primary\n      title: String!\n    }'
    }

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

    const expectedRequestBody = {
      schema:
        'type posts {\n      id: ID! @primary\n      title: String!\n    }'
    }

    const schema = `type posts {
      id: ID! @primary
      title: String!
    }`

    const saveColSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(202)
    })

    const store = createReduxStore(initialState);

    return store.dispatch(saveColSchema('MockProject1', 'mydb', 'posts', schema))
      .then(({ queued }) => {
        expect(queued).toBe(true)
        expect(saveColSchemaEndpoint.numberOfCalls).toBe(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {}

    const expectedRequestBody = {
      schema:
        'type posts {\n      id: ID! @primary\n      title: String!\n    }'
    }

    const schema = `type posts {
      id: ID! @primary
      title: String!
    }`

    const saveColSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/schema/mutate", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(500, {}, { error: "Failed with an error message" })
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveColSchema('MockProject1', 'mydb', 'posts', schema))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(saveColSchemaEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

})

describe("modify schema", () => {
  it("should not queued", () => {
    const initialState = {
      dbSchemas: {
        mydb: {
          users: 'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n      }'
        }
      }
    }
    const expectedRequestBody = {
      collections:
      {
        users:
        {
          schema:
            'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n}'
        }
      }
    }

    const modifyDbSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/schema/mutate", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody))
      return new Response(200)
    })
    const store = createReduxStore(initialState)

    return store.dispatch(modifyDbSchema("MockProject1", 'mydb'))
      .then(({ queued }) => {
        expect(modifyDbSchemaEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(false)
      })
  })

  it("should queued", () => {
    const initialState = {
      dbSchemas: {
        mydb: {
          users: 'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n      }'
        }
      }
    }
    const expectedRequestBody = {
      collections:
      {
        users:
        {
          schema:
            'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n}'
        }
      }
    }

    const modifyDbSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/schema/mutate", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody))
      return new Response(202)
    })
    const store = createReduxStore(initialState)

    return store.dispatch(modifyDbSchema("MockProject1", 'mydb'))
      .then(({ queued }) => {
        expect(modifyDbSchemaEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {
      dbSchemas: {
        mydb: {
          users: 'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n      }'
        }
      }
    }
    const expectedRequestBody = {
      collections:
      {
        users:
        {
          schema:
            'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n}'
        }
      }
    }

    const modifyDbSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/schema/mutate", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody))
      return new Response(500, {}, { error: "This is an error message" })
    })
    const store = createReduxStore(initialState)

    return store.dispatch(modifyDbSchema("MockProject1", 'mydb'))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(modifyDbSchemaEndpoint.numberOfCalls).toEqual(1)
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

  it("should have permissions", () => {
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
    const loadRulesEndpoint = server.get("/config/projects/:projectId/database/collections/rules", () => new Response(200, {}, { result: dbRules }))
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
    const loadRulesEndpoint = server.get("/config/projects/:projectId/database/collections/rules", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(loadDbRules('MockProject1'))
      .then(() => fail("This test has resolved. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(loadRulesEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe('save rules', () => {
  it("should not queued", () => {
    const initialState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {
              create: {
                rule: 'deny'
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
      }
    }
    const securityRules = {
      create: {
        rule: 'allow'
      },
      read: {
        rule: 'deny'
      },
      update: {
        rule: 'authenticated'
      },
      'delete': {
        rule: 'allow'
      }
    }
    const expectedState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {
              create: {
                rule: 'allow'
              },
              read: {
                rule: 'deny'
              },
              update: {
                rule: 'authenticated'
              },
              'delete': {
                rule: 'allow'
              }
            }
          }
        }
      }
    }
    const expectedRequestBody = {
      isRealtimeEnabled: true,
      rules:
      {
        create: { rule: 'allow' },
        read: { rule: 'deny' },
        update: { rule: 'authenticated' },
        delete: { rule: 'allow' }
      }
    }

    const saveColRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveColRule('MockProject1', 'mydb', 'users', securityRules, true))
      .then(({ queued }) => {
        expect(saveColRuleEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
      })
  })

  it("should queued", () => {
    const initialState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {
              create: {
                rule: 'deny'
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
      }
    }
    const securityRules = {
      create: {
        rule: 'allow'
      },
      read: {
        rule: 'deny'
      },
      update: {
        rule: 'authenticated'
      },
      'delete': {
        rule: 'allow'
      }
    }
    const expectedRequestBody = {
      isRealtimeEnabled: true,
      rules:
      {
        create: { rule: 'allow' },
        read: { rule: 'deny' },
        update: { rule: 'authenticated' },
        delete: { rule: 'allow' }
      }
    }

    const saveColRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(202)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveColRule('MockProject1', 'mydb', 'users', securityRules, true))
      .then(({ queued }) => {
        expect(saveColRuleEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {
              create: {
                rule: 'deny'
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
      }
    }
    const securityRules = {
      create: {
        rule: 'allow'
      },
      read: {
        rule: 'deny'
      },
      update: {
        rule: 'authenticated'
      },
      'delete': {
        rule: 'allow'
      }
    }
    const expectedRequestBody = {
      isRealtimeEnabled: true,
      rules:
      {
        create: { rule: 'allow' },
        read: { rule: 'deny' },
        update: { rule: 'authenticated' },
        delete: { rule: 'allow' }
      }
    }

    const saveColRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(500, {}, { error: "This is an error message" })
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveColRule('MockProject1', 'mydb', 'users', securityRules, true))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(saveColRuleEndpoint.numberOfCalls).toEqual(1)
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
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(loadCollections('MockProject1', 'mydb'))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe('save realtime enabled', () => {
  it("should not queued", () => {
    const initialState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {}
          }
        }
      }
    }
    const expectedState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: false,
            rules: {}
          }
        }
      }
    }
    const expectedRequestBody = {
      isRealtimeEnabled: false,
      rules: {}
    }

    const saveColRealtimeEnabledEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveColRealtimeEnabled('MockProject1', 'mydb', 'users', false))
      .then(({ queued }) => {
        expect(saveColRealtimeEnabledEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
      })
  })

  it("should queued", () => {
    const initialState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {}
          }
        }
      }
    }
    const expectedRequestBody = {
      isRealtimeEnabled: false,
      rules: {}
    }

    const saveColRealtimeEnabledEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(202)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveColRealtimeEnabled('MockProject1', 'mydb', 'users', false))
      .then(({ queued }) => {
        expect(saveColRealtimeEnabledEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {}
          }
        }
      }
    }
    const expectedRequestBody = {
      isRealtimeEnabled: false,
      rules: {}
    }

    const saveColRealtimeEnabledEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(500, {}, { error: "This is an error message" })
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveColRealtimeEnabled('MockProject1', 'mydb', 'users', false))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(saveColRealtimeEnabledEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe('untrack collections', () => {
  it("should not queued", () => {
    const initialState = {
      dbSchemas: {
        mydb: {
          users: 'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n      }'
        }
      },
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {
              create: {
                rule: 'deny'
              },
              read: {
                rule: 'deny'
              },
              update: {
                rule: 'allow'
              }
            }
          }
        }
      }
    }
    const expectedState = {
      dbSchemas: {
        mydb: {}
      },
      dbRules: {
        mydb: {}
      }
    }

    const untrackColEndpoint = server.delete("/config/projects/:projectId/database/:dbName/collections/:colName/schema/untrack", () => new Response(200))
    const store = createReduxStore(initialState);

    return store.dispatch(untrackCollection('MockProject1', 'mydb', 'users'))
      .then(({ queued }) => {
        expect(untrackColEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
      })
  })

  it("should queued", () => {
    const initialState = {}

    const untrackColEndpoint = server.delete("/config/projects/:projectId/database/:dbName/collections/:colName/schema/untrack", () => new Response(202))
    const store = createReduxStore(initialState);

    return store.dispatch(untrackCollection('MockProject1', 'mydb', 'users'))
      .then(({ queued }) => {
        expect(untrackColEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {}

    const untrackColEndpoint = server.delete("/config/projects/:projectId/database/:dbName/collections/:colName/schema/untrack", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);

    return store.dispatch(untrackCollection('MockProject1', 'mydb', 'users'))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(untrackColEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe("delete collections", () => {
  it("should not queued", () => {
    const initialState = {
      dbSchemas: {
        mydb: {
          users: 'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n      }'
        }
      },
      dbRules: {
        mydb: {
          users: {
            isRealtimeEnabled: true,
            rules: {
              create: {
                rule: 'deny'
              },
              read: {
                rule: 'deny'
              },
              update: {
                rule: 'allow'
              }
            }
          }
        }
      },
      dbCollections: {
        mydb: ['users']
      }
    }
    const expectedState = {
      dbSchemas: {
        mydb: {}
      },
      dbRules: {
        mydb: {}
      },
      dbCollections: {
        mydb: []
      }
    }

    const deleteColEndpoint = server.delete("/config/projects/:projectId/database/:dbName/collections/:colName", () => new Response(200))
    const store = createReduxStore(initialState);

    return store.dispatch(deleteCollection('MockProject1', 'mydb', 'users'))
      .then(({ queued }) => {
        expect(deleteColEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
      })
  })

  it("should queued", () => {
    const initialState = {}

    const deleteColEndpoint = server.delete("/config/projects/:projectId/database/:dbName/collections/:colName", () => new Response(202))
    const store = createReduxStore(initialState);

    return store.dispatch(deleteCollection('MockProject1', 'mydb', 'users'))
      .then(({ queued }) => {
        expect(deleteColEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {}

    const deleteColEndpoint = server.delete("/config/projects/:projectId/database/:dbName/collections/:colName", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);

    return store.dispatch(deleteCollection('MockProject1', 'mydb', 'users'))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(deleteColEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})


