import { createReduxStore } from "../../store";
import { Server, Response } from "miragejs";
import deepEqual from "deep-equal";
import { loadPreparedQueries } from './preparedQuery';

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
    return store.dispatch(loadPreparedQueries("MockProject1"))
      .then(() => {
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })

  it("should have permissions and dbPreparedQueries must be set", () => {
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
      permissions:  [
        {
          project: 'MockProject1',
          resource: 'db-prepared-query',
          verb: 'read'
        }
      ]
    }

    const preparedQueriesEndpoint = server.get("/config/projects/:projectId/database/prepared-queries", new Response(200, {}, {result: dbPreparedQueries}))
    const store = createReduxStore(initialState);

    return store.dispatch(loadPreparedQueries('MockProject1'))
      .then(() => {
        expect(preparedQueriesEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), expectedState)).toBe(true)
      })
  })

  it("should fail with 500 status code and promise must throw exception", () => {
    const initialState = {
      dbPreparedQueries: {},
      permissions:  [
        {
          project: 'MockProject1',
          resource: 'db-prepared-query',
          verb: 'read'
        }
      ]
    }
    const preparedQueriesEndpoint = server.get("/config/projects/:projectId/database/prepared-queries", new Response(500, {}, {error: "Failed with an error message"}))
    const store = createReduxStore(initialState)
    return store.dispatch(loadPreparedQueries('MockProject1'))
      .catch(ex => {
        expect(ex).toBeTruthy()
        expect(preparedQueriesEndpoint.numberOfCalls).toEqual(1)
        expect(deepEqual(store.getState(), initialState)).toBe(true)
      })
  })
})