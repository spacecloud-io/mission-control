const projects = [
  {
    "name": "TodoApp",
    "id": "todoapp",
    "secrets": [
      {
        "secret": "8cdd996458124490abf166b408068fb1",
        "isPrimary": true
      }
    ],
    "aesKey": "ZDA4Y2FiNWQxNzIzNGI4MmJhNTM2YzUzZGFjNTJmOTc=",
    "contextTimeGraphQL": 5,
    "modules": {
      "db": {
        "postgres": {
          "type": 'postgres',
          "conn": 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
          "dbName": "public",
          "collections": {
            "users": {
              "isRealtimeEnabled": true,
              "rules": {},
              "schema": 'type users {\n  id: ID! @primary\n  email: ID!\n  name: String!\n  pass: String!\n  role: String!\n}'
            },
            "default": {
              "isRealtimeEnabled": false,
              "rules": {
                "create": {
                  "rule": "deny"
                },
                "read": {
                  "rule": "deny"
                },
                "update": {
                  "rule": "deny"
                },
                "delete": {
                  "rule": "deny"
                }
              },
              "schema": 'type users {\n  id: ID! @primary\n  email: ID!\n  name: String!\n  pass: String!\n  role: String!\n}'
            }
          },
          "preparedQueries": {
            "preparedQuery1": {
              "id": "preparedQuery1",
              "sql": "select * from users",
              "rule": { "rule": "allow" },
              "args": ['args.args1']
            },
            "preparedQuery2": {
              "id": "preparedQuery2",
              "sql": "select * from posts",
              "rule": { "rule": "deny" },
              "args": ['args1', 'args2']
            }
          },
          "isPrimary": false,
          "enabled": true
        }
      },
      "eventing": {
        "enabled": true,
        "dbAlias": "postgres",
        "triggers": {
          "Trigger1": {
            "type": "MY_CUSTOM_EVENT",
            "url": "http://localhost:3000/v1/my-event",
            "retries": 3,
            "timeout": 5000
          }
        }
      },
      "userMan": {},
      "remoteServices": {
        "externalServices": {
          "auth": {
            "url": "localhost:3000",
            "endpoints": {
              "login": {
                "method":"POST",
                "path":"/v1/login",
                "rule": {
                  "rule": "allow"
                },
                "headers": [
                  { "key": "headerKey1", "value": "headerValue1" },
                  { "key": "headerKey2", "value": "headerValue2" }
                ]
              },
              "externalEndpoint": {
                "method":"GET",
                "path":"https://foo.com/bar",
                "kind":"external",
                "rule": {
                  "rule": "authenticated"
                },
                "token": "eyJhbGciOiJIUzI1NiJ9.ewogICJyb2xlIjogInVzZXIiCn0.BSQNTIL1Ktox0H_qyj7UHYBGlz9PiF06kEqDZptFJFA",
                "requestTemplate":`{ "id": "args.id"}`,
                "responseTemplate": `{ "key1": "res.val1"}`
              },
              "preparedQuery": {
                "kind":"prepared",
                "rule": {
                  "rule": "authenticated"
                },
                "outputFormat": "json",
                "token": "eyJhbGciOiJIUzI1NiJ9.ewogICJyb2xlIjogInVzZXIiCn0.BSQNTIL1Ktox0H_qyj7UHYBGlz9PiF06kEqDZptFJFA",
                "graphTemplate": `query { users @db }`,
                "requestTemplate":`{ "id": "args.id"}`,
                "responseTemplate": `{ "key1": "res.val1"}`
              },
            }
          }
        }
      },
      "deployments": {
        "services": [
          {
            "id": "service1",
            "version": "v1",
            "projectId": "todoapp",
            "scale": {
              "replicas": 0,
              "minReplicas": 0,
              "maxReplicas": 10,
              "concurrency": 50,
              "mode": "per-second"
            },
            "tasks": [
              {
                "id": "service1",
                "ports": [
                  {
                    "protocol": "http",
                    "port": 8080,
                    "name": "http"
                  },
                  {
                    "protocol": "http",
                    "port": 8081,
                    "name": "http"
                  }
                ],
                "resources": {
                  "cpu": 200,
                  "memory": 200,
                  "gpu": {
                    "type": "amd",
                    "value": 25
                  }
                },
                "docker": {
                  "cmd": ["node ./index.js"],
                  "image": "asd",
                  "secret": "DockerHubSecret",
                  "imagePullPolicy": "always"
                },
                "secrets": [
                  "EnvSecret"
                ],
                "env": {
                  "f00": "bar",
                  "key1": "val1"
                },
                "runtime": "image"
              }
            ],
            "whitelists": [
              {
                "projectId": "todoapp",
                "service": "s1"
              },
              {
                "projectId": "todoapp",
                "service": "s2"
              }
            ],
            "upstreams": [
              {
                "projectId": "todoapp",
                "service": "s3"
              },
              {
                "projectId": "myapp",
                "service": "s4"
              }
            ]
          }
        ]
      },
      "secrets": [
        {
          "id": "EnvSecret",
          "type": "env",
          "data": {
            "foo": "bar"
          }
        },
        {
          "id": "FileSecret",
          "type": "file",
          "rootPath": "/constants",
          "data": {
            "constants.json": "secret content"
          }
        },
        {
          "id": "DockerHubSecret",
          "type": "docker",
          "data": {
            "username": "user1",
            "password": "123",
            "url": "http://localhost:5000"
          }
        }
      ],
      "ingressRoutes": [
        {
          "id": "3f020b02cacd48e59e70fc371172a9b5",
          "source": {
            "hosts": [
              "example.com",
              "foo.bar"
            ],
            "methods": [
              "GET",
              "POST"
            ],
            "url": "/v1",
            "rewrite": "/v2",
            "type": "exact"
          },
          "targets": [
            {
              "scheme": "http",
              "host": "service1.project1.svc.cluster.local",
              "port": 80,
              "weight": 40
            },
            {
              "scheme": "https",
              "host": "qwerty",
              "port": 443,
              "weight": 60
            }
          ],
          "rule": { "rule": "allow" },
          "modify": {
            "headers": [
              { "key": "headerKey1", "value": "headerValue1" },
              { "key": "headerKey2", "value": "headerValue2" }
            ],
            "outputFormat": "json",
            "requestTemplate": "{\"yo\": \"lo\"}"
          }
        }
      ],
      "fileStore": {
        "enabled": true,
        "storeType": "amazon-s3",
        "bucket": "my-bucket",
        "conn": "us-east-1",
        "secret": "secrets.FileSecret.constants.json",
        "rules": [
          {
            "id": "Default Rule",
            "prefix": "/",
            "rule": {
              "create": {
                "rule": "allow"
              },
              "read": {
                "rule": "allow"
              },
              "delete": {
                "rule": "allow"
              }
            }
          },
          {
            "id": "Posts",
            "prefix": "/posts",
            "rule": {
              "create": {
                "rule": "allow"
              },
              "read": {
                "rule": "allow"
              },
              "delete": {
                "rule": "deny"
              }
            }
          }
        ]
      }
    }
  }
]

const clusterConfig = 
  {
    "email": "admin@gmail.com",
    "telemetry": true, 
    "credentials": { "user": "admin", "pass": "123" }
  }

const serviceRoutes = [
  {
    "id": "service1",
    "source": {
      "port": 8080
    },
    "targets": [
      {
        "type": "version",
        "version": "v1",
        "port": 8080,
        "weight": 70
      },
      {
        "type": "external",
        "host": "example.com",
        "port": 443,
        "weight": 10
      },
      {
        "type": "version",
        "version": "v2",
        "port": 8080,
        "weight": 20
      }
    ]
  }
]

const eventLogs = [
  {
    "_id": "1akiOBtFJRbXVZylSrHk0v81g0T",
    "event_ts": "2020-04-19T08:45:57Z",
    "invocation_logs": [
      {
        "_id": "1akiODs1zBt7JGLIIci7PvuImtx",
        "error_msg": "Post https://testappp.com: dial tcp: lookup testappp.com on 127.0.0.11:53: no such host",
        "invocation_time": "2020-04-19T08:45:57Z",
        "request_payload": "{\"specversion\":\"1.0-rc1\",\"type\":\"DB_INSERT\",\"source\":\"sc-auto-1akhzpHZA2HICSV50P6Mxg5Cg4B\",\"id\":\"1akiOBtFJRbXVZylSrHk0v81g0T\",\"time\":\"2020-04-19T08:45:57Z\",\"data\":{\"col\":\"pokemon\",\"db\":\"mongo\",\"doc\":{\"id\":\"5fd80b\",\"name\":\"labore Lorem\",\"power\":27,\"trainer_id\":\"736987\"},\"find\":{\"id\":\"5fd80b\"}}}",
        "response_body": "",
        "response_status_code": 0
      },
      {
        "_id": "1akiOluGX5543kzgpeBezwAWMrZ",
        "error_msg": "Post https://testappp.com: dial tcp: lookup testappp.com on 127.0.0.11:53: no such host",
        "invocation_time": "2020-04-19T08:46:02Z",
        "request_payload": "{\"specversion\":\"1.0-rc1\",\"type\":\"DB_INSERT\",\"source\":\"sc-auto-1akhzpHZA2HICSV50P6Mxg5Cg4B\",\"id\":\"1akiOBtFJRbXVZylSrHk0v81g0T\",\"time\":\"2020-04-19T08:45:57Z\",\"data\":{\"col\":\"pokemon\",\"db\":\"mongo\",\"doc\":{\"id\":\"5fd80b\",\"name\":\"labore Lorem\",\"power\":27,\"trainer_id\":\"736987\"},\"find\":{\"id\":\"5fd80b\"}}}",
        "response_body": "",
        "response_status_code": 0
      },
      {
        "_id": "1akiPRa8s1Lx0CTq0Un9El9esjt",
        "error_msg": "Post https://testappp.com: dial tcp: lookup testappp.com on 127.0.0.11:53: no such host",
        "invocation_time": "2020-04-19T08:46:07Z",
        "request_payload": "{\"specversion\":\"1.0-rc1\",\"type\":\"DB_INSERT\",\"source\":\"sc-auto-1akhzpHZA2HICSV50P6Mxg5Cg4B\",\"id\":\"1akiOBtFJRbXVZylSrHk0v81g0T\",\"time\":\"2020-04-19T08:45:57Z\",\"data\":{\"col\":\"pokemon\",\"db\":\"mongo\",\"doc\":{\"id\":\"5fd80b\",\"name\":\"labore Lorem\",\"power\":27,\"trainer_id\":\"736987\"},\"find\":{\"id\":\"5fd80b\"}}}",
        "response_body": "",
        "response_status_code": 0
      },
      {
        "_id": "1akiQ44zz9IYgmvQOzuJltbySKx",
        "error_msg": "Post https://testappp.com: dial tcp: lookup testappp.com on 127.0.0.11:53: no such host",
        "invocation_time": "2020-04-19T08:46:12Z",
        "request_payload": "{\"specversion\":\"1.0-rc1\",\"type\":\"DB_INSERT\",\"source\":\"sc-auto-1akhzpHZA2HICSV50P6Mxg5Cg4B\",\"id\":\"1akiOBtFJRbXVZylSrHk0v81g0T\",\"time\":\"2020-04-19T08:45:57Z\",\"data\":{\"col\":\"pokemon\",\"db\":\"mongo\",\"doc\":{\"id\":\"5fd80b\",\"name\":\"labore Lorem\",\"power\":27,\"trainer_id\":\"736987\"},\"find\":{\"id\":\"5fd80b\"}}}",
        "response_body": "",
        "response_status_code": 0
      }
    ],
    "rule_name": "Trigger1",
    "status": "failed"
  }
]
export default { projects, clusterConfig, serviceRoutes, eventLogs }