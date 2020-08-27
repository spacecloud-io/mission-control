import { createReduxStore } from "../../store";
import { Server, Response } from "miragejs";
import deepEqual from "deep-equal";
import { loadDbRules } from './rules';

let server;

beforeEach(() => {
  server = new Server()
  server.namespace = "v1"
  server.logging = false
})
afterEach(() => {
  server.shutdown()
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

  it("should fail with 500 status code and promise should throw exception", () => {
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
    const loadRulesEndpoint = server.get("/config/projects/:projectId/database/collections/rules", () => new Response(500, {}, {error: "Failed with an error message"}))
    const store = createReduxStore(initialState);
    return store.dispatch(loadDbRules("MockProject1"))
      .catch((ex) => {
        expect(ex).toBeTruthy()
        expect(loadRulesEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})