import { createReduxStore } from "../../store";
import { Server, Response } from "miragejs";
import { removeDbConfig, loadDbConfig, loadDBConnState } from "./config";
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

describe("remove database config", () => {

  const expectedHeaders = { 'content-type': 'application/json' }
  it("should not queued and dbAlias is not eventingDB", () => {
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

  it("should not have permissions and saveEventingConfig thunk must not be called", () => {
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

  it("should have permissions and saveEventingConfig thunk must be called", () => {
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

  it("should queued and redux state must not change", () => {
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

  it("should reject with 500 status code", () => {
    const initialState = {
      permissions: [
        {
          project: "MockProject1",
          resource: "eventing-config",
          verb: "modify"
        }
      ]
    }
    const dbConfigEndpoint = server.delete("/config/projects/:projectId/database/:dbName/config/database-config", () => new Response(500, {}, {error: "This is an error message"}))
    const store = createReduxStore(initialState);
    return store.dispatch(removeDbConfig("MockProject1", "mydb"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(dbConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

})

describe("load database config", () => {

  it("should not have permissions", () => {
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

  it("should have permissions and redux state must change", () => {
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

    const loadConfigEndpoint = server.get("/config/projects/:projectId/database/config", () => new Response(200, {}, {result: dbConfigs}))
    const store = createReduxStore(initialState);

    return store.dispatch(loadDbConfig("MockProject1"))
      .then(() => {
        expect(loadConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-config',
          verb: 'read'
        }
      ]
    }
    const loadConfigEndpoint = server.get("/config/projects/:projectId/database/config", () => new Response(500, {}, {error: "This is an error message"}))
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
    const dbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, {result: true}))
    const loadCollectionsEndpoint = server.get("/external/projects/:projectId/database/:dbName/list-collections", () => new Response(200, {}, {result: []}))
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
    const dbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(200, {}, {result: false}))
    const store = createReduxStore(initialState);

    return store.dispatch(loadDBConnState('MockProject1', 'mydb'))
      .then(connected => {
        expect(dbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(connected).toBe(false)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {}
    const dbConnStateEndpoint = server.get("/external/projects/:projectId/database/:dbName/connection-state", () => new Response(500, {}, {error: "This is an error message"}))
    const store = createReduxStore(initialState);
    return store.dispatch(loadDBConnState('MockProject1', 'mydb'))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(dbConnStateEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})