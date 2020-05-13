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
    "contextTime": 5,
    "modules": {
      "db": {
        "postgres": {
          "type": 'postgres',
          "conn": 'postgres://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable',
          "collections": {
            "users": {
              "isRealtimeEnabled": true,
              "rules": {},
              "schema": 'type users {\n  id: ID! @primary\n  email: ID!\n  name: String!\n  pass: String!\n  role: String!\n}'
            },
          },
          "preparedQueries": {
            "prepared-query-1": {
              "id": "prepared-query-1",
              "sql": "select * from users",
              "rule": { "allow": "true" },
              "args": ['args1']
            },
            "prepared-query-2": {
              "id": "prepared-query-2",
              "sql": "select * from users",
              "rule": { "allow": "true" },
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
            "endpoints": {}
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
              "host": "qwertyu",
              "port": 443,
              "weight": 60
            }
          ]
        }
      ],
      "fileStore": {
        "enabled": true,
        "storeType": "amazon-s3",
        "bucket": "my-bucket",
        "conn": "us-east-1",
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
export default { projects, serviceRoutes, eventLogs }