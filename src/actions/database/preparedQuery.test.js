import { createReduxStore } from "../../store";
import { Server, Response } from "miragejs";
import deepEqual from "deep-equal";
import { loadDbPreparedQueries, savePreparedQueryConfig, savePreparedQuerySecurityRule, deletePreparedQuery } from './preparedQuery';

let server;

beforeEach(() => {
  server = new Server()
  server.namespace = "v1"
  server.logging = false
})
afterEach(() => {
  server.shutdown()
})

describe("load prepared queries", () => {
  it('should not have permissions', () => {
    const initialState = {
      dbPreparedQueries: {},
      permissions: []
    }
    const store = createReduxStore(initialState);
    return store.dispatch(loadDbPreparedQueries("MockProject1"))
      .then(() => {
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

  it("should have permissions", () => {
    const initialState = {
      dbPreparedQueries: {},
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-prepared-query',
          verb: 'read'
        }
      ]
    }
    const dbPreparedQueries = [
      {
        "id": "preparedQuery1",
        "db": "mydb",
        "sql": "select * from users",
        "rule": {
          "rule": "and",
          "clauses": [
            {
              "rule": "webhook",
              "url": "localhost"
            }
          ]
        },
        "args": ['args.args1']
      },
      {
        "id": "default",
        "db": "mydb",
        "sql": "select * from users",
        "rule": {
          "rule": "allow"
        }
      }
    ]
    const expectedState = {
      dbPreparedQueries: {
        mydb: {
          preparedQuery1: {
            sql: 'select * from users',
            rule: {
              rule: 'and',
              clauses: [
                {
                  rule: 'webhook',
                  url: 'localhost'
                }
              ]
            },
            args: [
              'args.args1'
            ],
            id: 'preparedQuery1'
          },
          'default': {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          }
        }
      },
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-prepared-query',
          verb: 'read'
        }
      ]
    }

    const preparedQueriesEndpoint = server.get("/config/projects/:projectId/database/prepared-queries", new Response(200, {}, { result: dbPreparedQueries }))
    const store = createReduxStore(initialState);

    return store.dispatch(loadDbPreparedQueries('MockProject1'))
      .then(() => {
        expect(preparedQueriesEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {
      permissions: [
        {
          project: 'MockProject1',
          resource: 'db-prepared-query',
          verb: 'read'
        }
      ]
    }
    const preparedQueriesEndpoint = server.get("/config/projects/:projectId/database/prepared-queries", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(loadDbPreparedQueries('MockProject1'))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(preparedQueriesEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe("save prepared query config", () => {
  it("should not queued", () => {
    const initialState = {
      dbPreparedQueries: {
        mydb: {
          default: {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          }
        }
      }
    }
    const expectedState = {
      dbPreparedQueries: {
        mydb: {
          default: {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          },
          my_prepared_query: {
            id: 'my_prepared_query',
            sql: 'select * from users;',
            args: [],
            rule: {}
          }
        }
      }
    }
    const expectedRequestBody = {
      id: 'my_prepared_query',
      sql: 'select * from users;',
      args: [],
      rule: {}
    }

    const savePreparedQueryConfigEndpoint = server.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(savePreparedQueryConfig('MockProject1', 'mydb', 'my_prepared_query', [], 'select * from users;'))
      .then(({ queued }) => {
        expect(savePreparedQueryConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
      })
  })

  it("should queued", () => {

    const initialState = {};
    const expectedRequestBody = {
      id: 'my_prepared_query',
      sql: 'select * from users;',
      args: [],
      rule: {}
    }

    const savePreparedQueryConfigEndpoint = server.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(202)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(savePreparedQueryConfig('MockProject1', 'mydb', 'my_prepared_query', [], 'select * from users;'))
      .then(({ queued }) => {
        expect(savePreparedQueryConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {}
    const savePreparedQueryConfigEndpoint = server.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(savePreparedQueryConfig('MockProject1', 'mydb', 'my_prepared_query', [], 'select * from users;'))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(savePreparedQueryConfigEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe("save prepared query rule", () => {
  it("should not queued", () => {
    const initialState = {
      dbPreparedQueries: {
        mydb: {
          default: {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          },
          my_prepared_query: {
            id: 'my_prepared_query',
            sql: 'select * from users;',
            args: [],
            rule: {}
          }
        }
      }
    }
    const expectedState = {
      dbPreparedQueries: {
        mydb: {
          default: {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          },
          my_prepared_query: {
            id: 'my_prepared_query',
            sql: 'select * from users;',
            args: [],
            rule: {
              rule: 'allow'
            }
          }
        }
      }
    }
    const expectedRequestBody = {
      id: 'my_prepared_query',
      sql: 'select * from users;',
      args: [],
      rule: {
        rule: 'allow'
      }
    }

    const savePreparedQueryRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(200)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(savePreparedQuerySecurityRule('MockProject1', 'mydb', 'my_prepared_query', { rule: 'allow' }))
      .then(({ queued }) => {
        expect(savePreparedQueryRuleEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
      })
  })

  it("should queued", () => {

    const initialState = {
      dbPreparedQueries: {
        mydb: {
          default: {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          },
          my_prepared_query: {
            id: 'my_prepared_query',
            sql: 'select * from users;',
            args: [],
            rule: {}
          }
        }
      }
    };
    const expectedRequestBody = {
      id: 'my_prepared_query',
      sql: 'select * from users;',
      args: [],
      rule: {
        rule: 'allow'
      }
    }

    const savePreparedQueryRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", (_, request) => {
      expect(deepEqual(JSON.parse(request.requestBody), expectedRequestBody)).toBe(true)
      return new Response(202)
    })
    const store = createReduxStore(initialState);

    return store.dispatch(savePreparedQuerySecurityRule('MockProject1', 'mydb', 'my_prepared_query', { rule: 'allow' }))
      .then(({ queued }) => {
        expect(savePreparedQueryRuleEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {}
    const savePreparedQueryRuleEndpoint = server.post("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(savePreparedQuerySecurityRule('MockProject1', 'mydb', 'my_prepared_query', { rule: 'allow' }))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(savePreparedQueryRuleEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})

describe("delete prepared query", () => {
  it("should not queued", () => {
    const initialState = {
      dbPreparedQueries: {
        mydb: {
          default: {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          },
          my_prepared_query: {
            id: 'my_prepared_query',
            sql: 'select * from users;',
            args: [],
            rule: {}
          }
        }
      }
    }
    const expectedState = {
      dbPreparedQueries: {
        mydb: {
          default: {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          }
        }
      }
    }

    const deletePreparedQueryEndpoint = server.delete("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => new Response(200))
    const store = createReduxStore(initialState);

    return store.dispatch(deletePreparedQuery('MockProject1', 'mydb', 'my_prepared_query'))
      .then(({ queued }) => {
        expect(deletePreparedQueryEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
        expect(queued).toBe(false)
      })
  })

  it("should queued", () => {

    const initialState = {
      dbPreparedQueries: {
        mydb: {
          default: {
            sql: 'select * from users',
            rule: {
              rule: 'allow'
            },
            id: 'default'
          },
          my_prepared_query: {
            id: 'my_prepared_query',
            sql: 'select * from users;',
            args: [],
            rule: {}
          }
        }
      }
    };

    const deletePreparedQueryEndpoint = server.delete("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => new Response(202))
    const store = createReduxStore(initialState);

    return store.dispatch(deletePreparedQuery('MockProject1', 'mydb', 'my_prepared_query'))
      .then(({ queued }) => {
        expect(deletePreparedQueryEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
        expect(queued).toBe(true)
      })
  })

  it("should reject with 500 status code", () => {
    const initialState = {}
    const deletePreparedQueryEndpoint = server.delete("/config/projects/:projectId/database/:dbName/prepared-queries/:id", () => new Response(500, {}, { error: "This is an error message" }))
    const store = createReduxStore(initialState);
    return store.dispatch(deletePreparedQuery('MockProject1', 'mydb', 'my_prepared_query'))
      .then(() => fail("This test has resolved the promise. It should reject"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(deletePreparedQueryEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})
