import { createReduxStore } from "../../store";
import { Server, Response } from "miragejs";
import { removeDbConfig, loadDbConfig, loadDBConnState, saveDbConfig, addDatabase, enableDb, disableDb, changeDbName } from "./config";
import deepEqual from "deep-equal";

let server;

beforeEach(() => {
  server = new Server()
  server.namespace = "v1"
  server.logging = false
})
afterEach(() => {
  server.shutdown()
})

describe("load database config", () => {

  it("should handle unauthorized request", () => {
    // initial states
    const initialState = {
      dbConfigs: {},
      permissions: []
    }
    const store = createReduxStore(initialState);

    return store.dispatch(loadDbConfig("MockProject1"))
      .then(() => {
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

  it("should handle authorized request and redux state must change", () => {
    // initial states
    const initialState = {
      dbConfigs: {},
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-config',
          verb: 'read'
        }
      ]
    }
    const dbConfigs = [
      {
        "mydb": {
          "type": 'postgres',
          "conn": 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          "name": "public",
          "enabled": true
        }
      },
      {
        "mydb2": {
          "type": 'postgres',
          "conn": 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          "name": "public",
          "enabled": true
        }
      }
    ]
    // expected states
    const expectedState = {
      dbConfigs: {
        mydb: {
          type: 'postgres',
          conn: 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          name: 'public',
          enabled: true
        },
        mydb2: {
          type: 'postgres',
          conn: 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          name: 'public',
          enabled: true
        }
      },
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-config',
          verb: 'read'
        }
      ]
    }

    const loadConfigEndpoint = server.get("/config/projects/:projectId/database/config", () => new Response(200, {}, { result: dbConfigs }))
    const store = createReduxStore(initialState);

    return store.dispatch(loadDbConfig("MockProject1"))
      .then(() => {
        expect(loadConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should handle server error", () => {
    const initialState = {
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-config',
          verb: 'read'
        }
      ]
    }
    const loadConfigEndpoint = server.get("/config/projects/:projectId/database/config", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(loadDbConfig("MockProject1"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(loadConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

})

describe("database connection state", () => {
  it("should be true", () => {
    const initialState = {
      dbConnState: {},
      dbCollections: {}
    }
    const expectedState = {
      dbConnState: {
        mydb: true
      },
      dbCollections: {
        mydb: []
      }
    }
    const dbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200, {}, { result: [] }))
    const store = createReduxStore(initialState);

    return store.dispatch(loadDBConnState('MockProject1', 'mydb'))
      .then(connected => {
        expect(dbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(connected).toBe(true)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should be false", () => {
    const initialState = {
      dbConnState: {},
      dbCollections: {}
    }
    const expectedState = {
      dbConnState: {
        mydb: false
      },
      dbCollections: {}
    }
    const dbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: false }))
    const store = createReduxStore(initialState);

    return store.dispatch(loadDBConnState('MockProject1', 'mydb'))
      .then(connected => {
        expect(dbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(connected).toBe(false)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should handle server error", () => {
    const initialState = {}
    const dbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(loadDBConnState('MockProject1', 'mydb'))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(dbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe("save db config", () => {
  it("should handle usual flow", () => {
    const initialState = {}
    const expectedState = {
      dbConfigs: {
        mydb: {
          enabled: true,
          type: 'mongo',
          conn: 'mongodb://localhost:27017',
          name: 'mockproject1'
        }
      },
      dbConnState: { mydb: true },
      dbCollections: { mydb: [] }
    }
    const expectedRequestBody = {
      enabled: true,
      type: 'mongo',
      conn: 'mongodb://localhost:27017',
      name: 'mockproject1'
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const loadDbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200))

    const store = createReduxStore(initialState);

    return store.dispatch(saveDbConfig('MockProject1', 'mydb', true, "mongodb://localhost:27017", "mongo", "mockproject1"))
      .then(({ connected }) => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(loadDbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(connected).toBe(true)
      })
  })

  it("should handle status 202", () => {
    const initialState = {}
    const expectedRequestBody = {
      enabled: true,
      type: 'mongo',
      conn: 'mongodb://localhost:27017',
      name: 'mockproject1'
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(202)
    })

    const store = createReduxStore(initialState);

    return store.dispatch(saveDbConfig('MockProject1', 'mydb', true, "mongodb://localhost:27017", "mongo", "mockproject1"))
      .then(({ queued }) => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should handle server error", () => {
    const initialState = {}
    const expectedRequestBody = {
      enabled: true,
      type: 'mongo',
      conn: 'mongodb://localhost:27017',
      name: 'mockproject1'
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(500, {}, { error: "This is an error message" })
    })
    const store = createReduxStore(initialState);

    return store.dispatch(saveDbConfig('MockProject1', 'mydb', true, "mongodb://localhost:27017", "mongo", "mockproject1"))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe("add database", () => {
  it("does not have any permissions", () => {
    const initialState = {}
    const expectedState = {
      dbConfigs: {
        mydb: {
          enabled: true,
          type: 'mongo',
          conn: 'mongodb://localhost:27017',
          name: 'mockproject1'
        }
      },
      dbConnState: { mydb: true },
      dbCollections: { mydb: [] }
    }
    const expectedRequestBody = {
      enabled: true,
      type: 'mongo',
      conn: 'mongodb://localhost:27017',
      name: 'mockproject1'
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const loadDbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200))

    const store = createReduxStore(initialState);

    return store.dispatch(addDatabase('MockProject1', 'mydb', 'mongo', 'mockproject1', 'mongodb://localhost:27017'))
      .then(({ queued, enabledEventing }) => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(loadDbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
        expect(enabledEventing).toBe(false)
      })
  })

  it("has all permissions", () => {
    const initialState = {
      permissions: [
        {
          project: "*",
          resource: "*",
          verb: "*"
        }
      ]
    }
    const expectedState = {
      permissions: [{ project: '*', resource: '*', verb: '*' }],
      dbConfigs:
      {
        mydb:
        {
          enabled: true,
          type: 'mysql',
          conn: 'root:my-secret-pw@tcp(localhost:3306)/',
          name: 'mockproject1'
        }
      },
      dbConnState: { mydb: true },
      dbCollections: { mydb: [] },
      dbRules: {
        mydb: {
          default: {
            rules: {
              create: {
                rule: 'allow'
              },
              read: {
                rule: 'allow'
              },
              update: {
                rule: 'allow'
              },
              delete: {
                rule: 'allow'
              }
            },
            isRealtimeEnabled: false
          }
        }
      },
      dbPreparedQueries: { mydb: { default: { rule: { rule: 'allow' } } } },
      eventingConfig: { enabled: true, dbAlias: 'mydb' }
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      const expectedRequestBody = {
        enabled: true,
        type: 'mysql',
        conn: 'root:my-secret-pw@tcp(localhost:3306)/',
        name: 'mockproject1'
      }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const loadDbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200))
    const saveCollectionRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", (_, request) => {
      const expectedRequestBody = {
        isRealtimeEnabled: false,
        rules:
        {
          create: { rule: 'allow' },
          read: { rule: 'allow' },
          update: { rule: 'allow' },
          delete: { rule: 'allow' }
        }
      }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const savePreparedQueryRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", (_, request) => {
      const expectedRequestBody = { id: 'default', sql: '', args: [], rule: { rule: 'allow' } }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const saveEventingConfigEndpoint = server.post("/config/projects/:projectId/eventing/config/eventing-config", (_, request) => {
      const expectedRequestBody = { enabled: true, dbAlias: "mydb" }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const saveEventingRuleEndpoint = server.post("/config/projects/:projectId/eventing/rules/:type", (_, request) => {
      const expectedRequestBody = { rule: "allow", id: "default" }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })

    const store = createReduxStore(initialState);

    return store.dispatch(addDatabase('MockProject1', 'mydb', 'mysql', 'mockproject1', 'root:my-secret-pw@tcp(localhost:3306)/'))
      .then(({ queued, enabledEventing }) => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(loadDbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(saveCollectionRuleEndpoint.numberOfCalls).toEqual(1)
        expect(savePreparedQueryRuleEndpoint.numberOfCalls).toEqual(1)
        expect(saveEventingConfigEndpoint.numberOfCalls).toEqual(1)
        expect(saveEventingRuleEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
        expect(enabledEventing).toBe(true)
      })
  })

  it("has eventing already enabled", () => {
    const initialState = {
      dbConfigs: {
        mongodb: {
          enabled: true,
          type: 'mongo',
          conn: 'mongodb://localhost:27017/',
          name: 'development'
        }
      },
      eventingConfig: { enabled: true, dbAlias: 'mongodb' },
      permissions: [
        {
          project: "*",
          resource: "*",
          verb: "*"
        }
      ]
    }
    const expectedState = {
      dbConfigs:
      {
        mongodb: {
          enabled: true,
          type: 'mongo',
          conn: 'mongodb://localhost:27017/',
          name: 'development'
        },
        mydb:
        {
          enabled: true,
          type: 'mysql',
          conn: 'root:my-secret-pw@tcp(localhost:3306)/',
          name: 'mockproject1'
        }
      },
      dbConnState: { mydb: true },
      dbCollections: { mydb: [] },
      eventingConfig: { enabled: true, dbAlias: 'mongodb' },
      permissions: [
        {
          project: "*",
          resource: "*",
          verb: "*"
        }
      ]
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      const expectedRequestBody = {
        enabled: true,
        type: 'mysql',
        conn: 'root:my-secret-pw@tcp(localhost:3306)/',
        name: 'mockproject1'
      }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const loadDbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200))
    const saveCollectionRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/collections/:colName/rules", (_, request) => {
      const expectedRequestBody = {
        isRealtimeEnabled: false,
        rules:
        {
          create: { rule: 'allow' },
          read: { rule: 'allow' },
          update: { rule: 'allow' },
          delete: { rule: 'allow' }
        }
      }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const savePreparedQueryRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", (_, request) => {
      const expectedRequestBody = { id: 'default', sql: '', args: [], rule: { rule: 'allow' } }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })

    const store = createReduxStore(initialState);

    return store.dispatch(addDatabase('MockProject1', 'mydb', 'mysql', 'mockproject1', 'root:my-secret-pw@tcp(localhost:3306)/'))
      .then(({ queued, enabledEventing }) => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(loadDbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(saveCollectionRuleEndpoint.numberOfCalls).toEqual(1)
        expect(savePreparedQueryRuleEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
        expect(enabledEventing).toBe(false)
      })
  })
})

describe("enable db", () => {
  it("resolves", () => {
    const initialState = {
      dbConfigs: {
        mydb: {
          enabled: false,
          type: 'postgres',
          conn: 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          name: 'public'
        }
      }
    }
    const expectedState = {
      dbConfigs: {
        mydb: {
          enabled: true,
          type: 'postgres',
          conn: 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          name: 'public'
        }
      },
      dbConnState: { mydb: true },
      dbCollections: { mydb: [] }
    }
    const expectedRequestBody = {
      enabled: true,
      type: 'postgres',
      conn: 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
      name: 'public'
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const loadDbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200))

    const store = createReduxStore(initialState);

    return store.dispatch(enableDb('MockProject1', 'mydb', 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable'))
      .then(({ connected }) => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(loadDbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(connected).toBe(true)
      })

  })
})

describe("disable db", () => {
  it("resolves", () => {
    const initialState = {
      dbConfigs: {
        mydb: {
          enabled: true,
          type: 'postgres',
          conn: 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          name: 'public'
        }
      }
    }
    const expectedState = {
      dbConfigs:
      {
        mydb:
        {
          enabled: false,
          type: 'postgres',
          conn:
            'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          name: 'public'
        }
      },
      dbConnState: { mydb: true },
      dbCollections: { mydb: [] }
    }
    const expectedRequestBody = {
      enabled: false,
      type: 'postgres',
      conn: 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
      name: 'public'
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const loadDbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200))

    const store = createReduxStore(initialState);

    return store.dispatch(disableDb('MockProject1', 'mydb'))
      .then(() => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(loadDbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })
})

describe("change db name", () => {

  it("has permissions to change schema", () => {
    const initialState = {
      dbConfigs: {
        mydb: {
          enabled: true,
          type: 'mongo',
          conn: 'mongodb://localhost:27017',
          name: 'mockproject1'
        }
      },
      dbSchemas: {
        mydb: {
          users: 'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n      }'
        }
      },
      permissions: [
        {
          project: "*",
          resource: "*",
          verb: "*"
        }
      ]
    }
    const expectedState = {
      dbConfigs: {
        mydb: {
          enabled: true,
          type: 'mongo',
          conn: 'mongodb://localhost:27017',
          name: 'newprojectname'
        }
      },
      dbConnState: { mydb: true },
      dbCollections: { mydb: [] },
      dbSchemas: {
        mydb: {
          users: 'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n      }'
        }
      },
      permissions: [
        {
          project: "*",
          resource: "*",
          verb: "*"
        }
      ]
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      const expectedRequestBody = {
        enabled: true,
        type: 'mongo',
        conn: 'mongodb://localhost:27017',
        name: 'newprojectname'
      }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const loadDbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200))
    const modifyDbSchemaEndpoint = server.post("/config/projects/:projectId/database/:dbName/schema/mutate", (_, request) => {
      const expectedRequestBody = {
        collections:
        {
          users:
          {
            schema:
              'type users {\n        id: ID! @primary\n        name: String!\n        age: Integer\n        posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)\n      }'
          }
        }
      }
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })

    const store = createReduxStore(initialState);

    return store.dispatch(changeDbName('MockProject1', 'mydb', 'newprojectname'))
      .then(() => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(loadDbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(modifyDbSchemaEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("does not have permissions to change schema", () => {
    const initialState = {
      dbConfigs: {
        mydb: {
          enabled: true,
          type: 'mongo',
          conn: 'mongodb://localhost:27017',
          name: 'mockproject1'
        }
      }
    }
    const expectedState = {
      dbConfigs: {
        mydb: {
          enabled: true,
          type: 'mongo',
          conn: 'mongodb://localhost:27017',
          name: 'newprojectname'
        }
      },
      dbConnState: { mydb: true },
      dbCollections: { mydb: [] }
    }
    const expectedRequestBody = {
      enabled: true,
      type: 'mongo',
      conn: 'mongodb://localhost:27017',
      name: 'newprojectname'
    }

    const saveDbConfigEndpoint = server.post("/config/projects/:projectId/database/:db/config/database-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const loadDbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, { result: true }))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200))

    const store = createReduxStore(initialState);

    return store.dispatch(changeDbName('MockProject1', 'mydb', 'newprojectname'))
      .then(() => {
        expect(saveDbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(loadDbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(loadCollectionsEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })
})

describe("remove database config", () => {

  const expectedHeaders = { 'content-type': 'application/json' }
  it("should handle usual flow and dbAlias is not eventingDB", () => {
    // initial states
    const initialState = {
      dbConfigs: {
        mydb: {},
        mydb2: {}
      },
      dbSchemas: {
        mydb: {},
        mydb2: {}
      },
      dbRules: {
        mydb: {},
        mydb2: {}
      },
      dbPreparedQueries: {
        mydb: {},
        mydb2: {}
      },
      eventingConfig: {
        enabled: true,
        dbAlias: "mydb2"
      }
    }
    // expected states
    const expectedState = {
      dbConfigs: {
        mydb2: {}
      },
      dbSchemas: {
        mydb2: {}
      },
      dbRules: {
        mydb2: {}
      },
      dbPreparedQueries: {
        mydb2: {}
      },
      eventingConfig: {
        enabled: true,
        dbAlias: "mydb2"
      }
    }
    // mock endpoints
    const dbConfigEndpoint = server.delete("/config/projects/:projectId/database/:dbName/config/database-config", (_, request) => {
      expect(deepEqual(request.requestHeaders, expectedHeaders)).toBe(true)
      return new Response(200)
    })
    // mock store
    const store = createReduxStore(initialState);

    return store.dispatch(removeDbConfig("MockProject1", "mydb"))
      .then(({ queued }) => {
        expect(deepEqual(store.getState(), expectedState)).toBe(true);
        expect(dbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(queued).toBe(false)
      })
  })

  it("should handle unauthorized request and saveEventingConfig thunk must not be called", () => {
    // initial states
    const initialState = {
      dbConfigs: {
        mydb: {},
        mydb2: {}
      },
      dbSchemas: {
        mydb: {},
        mydb2: {}
      },
      dbRules: {
        mydb: {},
        mydb2: {}
      },
      dbPreparedQueries: {
        mydb: {},
        mydb2: {}
      },
      eventingConfig: {
        enabled: true,
        dbAlias: "mydb"
      },
      permissions: []
    }
    // expected states
    const expectedState = {
      dbConfigs: {
        mydb2: {}
      },
      dbSchemas: {
        mydb2: {}
      },
      dbRules: {
        mydb2: {}
      },
      dbPreparedQueries: {
        mydb2: {}
      },
      eventingConfig: {
        enabled: true,
        dbAlias: "mydb"
      },
      permissions: []
    }
    // mock endpoints
    const dbConfigEndpoint = server.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => new Response(200))
    // mock store
    const store = createReduxStore(initialState);

    return store.dispatch(removeDbConfig("MockProject1", "mydb"))
      .then(({ queued }) => {
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(dbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(queued).toBe(false)
      })

  })

  it("should handle authorized request and saveEventingConfig thunk must be called", () => {
    // initial states
    const initialState = {
      dbConfigs: {
        mydb: {},
        mydb2: {}
      },
      dbSchemas: {
        mydb: {},
        mydb2: {}
      },
      dbRules: {
        mydb: {},
        mydb2: {}
      },
      dbPreparedQueries: {
        mydb: {},
        mydb2: {}
      },
      eventingConfig: {
        enabled: true,
        dbAlias: "mydb"
      },
      permissions: [
        {
          project: "MockProject1",
          resource: "eventing-config",
          verb: "modify"
        }
      ]
    }
    // expected states
    const expectedState = {
      dbConfigs: {
        mydb2: {}
      },
      dbSchemas: {
        mydb2: {}
      },
      dbRules: {
        mydb2: {}
      },
      dbPreparedQueries: {
        mydb2: {}
      },
      eventingConfig: {
        enabled: false,
        dbAlias: ""
      },
      permissions: [
        {
          project: "MockProject1",
          resource: "eventing-config",
          verb: "modify"
        }
      ]
    }
    const expectedRequestBody = {
      enabled: false,
      dbAlias: ""
    }
    // mock endpoints
    const dbConfigEndpoint = server.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => new Response(200))
    const eventingConfigEndpoint = server.post("/config/projects/:projectId/eventing/config/eventing-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    // mock store
    const store = createReduxStore(initialState);

    return store.dispatch(removeDbConfig("MockProject1", "mydb"))
      .then(({ queued }) => {
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(dbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(eventingConfigEndpoint.numberOfCalls).toEqual(1)
        expect(queued).toBe(false)
      })

  })

  it("should handle status 202 and redux state must not change", () => {
    // initial states
    const initialState = {
      dbConfigs: {
        mydb: {},
        mydb2: {}
      },
      dbSchemas: {
        mydb: {},
        mydb2: {}
      },
      dbRules: {
        mydb: {},
        mydb2: {}
      },
      dbPreparedQueries: {
        mydb: {},
        mydb2: {}
      },
      eventingConfig: {
        enabled: true,
        dbAlias: "mydb"
      },
      permissions: [
        {
          project: "MockProject1",
          resource: "eventing-config",
          verb: "modify"
        }
      ]
    }
    // expected states
    const expectedRequestBody = {
      enabled: false,
      dbAlias: ""
    }
    // mock endpoints
    const dbConfigEndpoint = server.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => new Response(202))
    const eventingConfigEndpoint = server.post("/config/projects/:projectId/eventing/config/eventing-config", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(202)
    })
    // mock store
    const store = createReduxStore(initialState);

    return store.dispatch(removeDbConfig("MockProject1", "mydb"))
      .then(({ queued }) => {
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(dbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(eventingConfigEndpoint.numberOfCalls).toEqual(1)
        expect(queued).toBe(true);
      });
  })

  it("should handle server error", () => {
    const initialState = {
      permissions: [
        {
          project: "MockProject1",
          resource: "eventing-config",
          verb: "modify"
        }
      ]
    }
    const dbConfigEndpoint = server.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(removeDbConfig("MockProject1", "mydb"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(dbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

})