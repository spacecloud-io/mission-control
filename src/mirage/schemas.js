let project = {
    "name": "Test",
    "id": "Test",
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
        "mongo": {
          "type": 'mongo',
          "conn": 'mongodb://localhost:27017',
          "collections": {
            "TestCollection1": {
              "isRealtimeEnabled": true,
              "rules": {},
              "schema": 'type TestCollection {\n  _id: ID! @primary\n}'
            },
            "TestCollection2": {
              "isRealtimeEnabled": true,
              "rules": {},
              "schema": 'type testtt {\n  _id: ID! @primary\n}'
            }
          },
          "isPrimary": false,
          "enabled": true
        }
      },
      "eventing": {},
      "userMan": {},
      "remoteServices": {
        "externalServices": {}
      },
      "fileStore": {
        "enabled": false,
        "rules": []
      }
    }
}


let serviceRoute = {
        "id": "1", 
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


let eventLog = {"event_logs":[{"_id":"1akiOBtFJRbXVZylSrHk0v81g0T","event_ts":"2020-04-19T08:45:57Z","invocation_logs":[{"_id":"1akiODs1zBt7JGLIIci7PvuImtx","error_msg":"Post https://testappp.com: dial tcp: lookup testappp.com on 127.0.0.11:53: no such host","invocation_time":"2020-04-19T08:45:57Z","request_payload":"{\"specversion\":\"1.0-rc1\",\"type\":\"DB_INSERT\",\"source\":\"sc-auto-1akhzpHZA2HICSV50P6Mxg5Cg4B\",\"id\":\"1akiOBtFJRbXVZylSrHk0v81g0T\",\"time\":\"2020-04-19T08:45:57Z\",\"data\":{\"col\":\"pokemon\",\"db\":\"mongo\",\"doc\":{\"id\":\"5fd80b\",\"name\":\"labore Lorem\",\"power\":27,\"trainer_id\":\"736987\"},\"find\":{\"id\":\"5fd80b\"}}}","response_body":"","response_status_code":0},{"_id":"1akiOluGX5543kzgpeBezwAWMrZ","error_msg":"Post https://testappp.com: dial tcp: lookup testappp.com on 127.0.0.11:53: no such host","invocation_time":"2020-04-19T08:46:02Z","request_payload":"{\"specversion\":\"1.0-rc1\",\"type\":\"DB_INSERT\",\"source\":\"sc-auto-1akhzpHZA2HICSV50P6Mxg5Cg4B\",\"id\":\"1akiOBtFJRbXVZylSrHk0v81g0T\",\"time\":\"2020-04-19T08:45:57Z\",\"data\":{\"col\":\"pokemon\",\"db\":\"mongo\",\"doc\":{\"id\":\"5fd80b\",\"name\":\"labore Lorem\",\"power\":27,\"trainer_id\":\"736987\"},\"find\":{\"id\":\"5fd80b\"}}}","response_body":"","response_status_code":0},{"_id":"1akiPRa8s1Lx0CTq0Un9El9esjt","error_msg":"Post https://testappp.com: dial tcp: lookup testappp.com on 127.0.0.11:53: no such host","invocation_time":"2020-04-19T08:46:07Z","request_payload":"{\"specversion\":\"1.0-rc1\",\"type\":\"DB_INSERT\",\"source\":\"sc-auto-1akhzpHZA2HICSV50P6Mxg5Cg4B\",\"id\":\"1akiOBtFJRbXVZylSrHk0v81g0T\",\"time\":\"2020-04-19T08:45:57Z\",\"data\":{\"col\":\"pokemon\",\"db\":\"mongo\",\"doc\":{\"id\":\"5fd80b\",\"name\":\"labore Lorem\",\"power\":27,\"trainer_id\":\"736987\"},\"find\":{\"id\":\"5fd80b\"}}}","response_body":"","response_status_code":0},{"_id":"1akiQ44zz9IYgmvQOzuJltbySKx","error_msg":"Post https://testappp.com: dial tcp: lookup testappp.com on 127.0.0.11:53: no such host","invocation_time":"2020-04-19T08:46:12Z","request_payload":"{\"specversion\":\"1.0-rc1\",\"type\":\"DB_INSERT\",\"source\":\"sc-auto-1akhzpHZA2HICSV50P6Mxg5Cg4B\",\"id\":\"1akiOBtFJRbXVZylSrHk0v81g0T\",\"time\":\"2020-04-19T08:45:57Z\",\"data\":{\"col\":\"pokemon\",\"db\":\"mongo\",\"doc\":{\"id\":\"5fd80b\",\"name\":\"labore Lorem\",\"power\":27,\"trainer_id\":\"736987\"},\"find\":{\"id\":\"5fd80b\"}}}","response_body":"","response_status_code":0}],"rule_name":"TriggerTestt","status":"failed"}]}


export { project, serviceRoute, eventLog }