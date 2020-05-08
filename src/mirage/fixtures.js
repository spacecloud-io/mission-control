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
            }
          },
          "isPrimary": false,
          "enabled": true
        }
      },
      "eventing": {
        "enabled": true,
        "dbAlias": "mydb"
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
    "id": "myapp",
    "source": {
      "port": 8080
    },
    "targets": [
      {
        "type": "version",
        "version": "v1",
        "port": 8080,
        "weight": 100
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