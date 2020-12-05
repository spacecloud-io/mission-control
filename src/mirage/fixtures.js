import { deploymentStatuses } from "../constants"

export const projects = [
  {
    "name": "MockProject1",
    "id": "mockproject1",
    "secrets": [
      {
        "secret": "8cdd996458124490abf166b408068fb1",
        "isPrimary": true
      }
    ],
    "aesKey": "ZDA4Y2FiNWQxNzIzNGI4MmJhNTM2YzUzZGFjNTJmOTc=",
    "contextTimeGraphQL": 20
  },
  {
    "name": "MockProject2",
    "id": "mockproject2",
    "secrets": [
      {
        "secret": "8cdd996458124490abf166b408068fb1",
        "isPrimary": true
      }
    ],
    "aesKey": "ZDA4Y2FiNWQxNzIzNGI4MmJhNTM2YzUzZGFjNTJmOTc=",
    "contextTimeGraphQL": 10
  }
]

export const dbConfigs = [
  {
    "dbAlias": "mydb1",
    "type": 'mongo',
    "conn": 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
    "name": "public",
    "enabled": true,
    "limit": 100,
    "driverConf": {
      "maxConn": 400,
      "maxIdleConn": 40,
      "maxIdleTimeout": 600000
    }
  },
  {
    "dbAlias": "mydb2",
    "type": 'postgres',
    "conn": 'postgres://postgres:mysecretpassword@postgres.db.svc.cluster.local:5432/postgres?sslmode=disable',
    "name": "public",
    "enabled": true
  }
]

export const dbSchemas = [
  {
    dbAlias: "mydb1",
    col: "users",
    schema: `type users {
  id: ID! @primary
  name: String!
  age: Integer
  posts: [posts] @link(table: posts, from: id, to: author_id, db: mydb2)
}`
  },
  {
    dbAlias: "mydb2",
    col: "posts",
    schema: `type posts {
  id: ID! @primary
  title: String!
  author_id: ID
}`
  }
]

export const dbRules = [
  {
    dbAlias: "mydb1",
    col: "users",
    isRealtimeEnabled: true,
    enableCacheInvalidation: true,
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
]

export const dbPreparedQueries = [
  {
    "id": "preparedQuery1",
    "dbAlias": "mydb1",
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
    "dbAlias": "mydb1",
    "sql": "select * from users",
    "rule": {
      "rule": "allow"
    }
  }
]

export const eventingConfig = [
  {
    "enabled": true,
    "dbAlias": "mydb1"
  }
]

export const eventingSchemas = []

export const eventingRules = [
  {
    "id": "MY_CUSTOM_EVENT",
    "rule": "allow"
  }
]

export const eventingTriggers = [
  {
    "id": "Trigger1",
    "type": "MY_CUSTOM_EVENT",
    "url": "http://localhost:3000/v1/my-event",
    "retries": 3,
    "timeout": 5000,
    "filter": {
      "rule": "match",
      "eval": "==",
      "type": "string",
      "f1": "args.data.doc.status",
      "f2": "closed"
    }
  },
  {
    "id": "UserAdded",
    "type": "DB_INSERT",
    "url": "https://httpbin.org/post",
    "retries": 5,
    "timeout": 2000,
    "options": {
      "db": "mydb1",
      "col": "users"
    }
  },
  {
    "id": "UserDeleted",
    "type": "DB_DELETE",
    "url": "https://httpbin.org/post",
    "retries": 5,
    "timeout": 2000,
    "options": {
      "db": "mydb1",
      "col": "users"
    }
  },
  {
    "id": "PostAdded",
    "type": "DB_INSERT",
    "url": "https://httpbin.org/post",
    "retries": 5,
    "timeout": 2000,
    "options": {
      "db": "mydb2",
      "col": "posts"
    }
  },
  {
    "id": "FileAdded",
    "type": "FILE_CREATE",
    "url": "https://httpbin.org/post",
    "retries": 5,
    "timeout": 2000
  },
  {
    "id": "FileDeleted",
    "type": "FILE_DELETE",
    "url": "https://httpbin.org/post",
    "retries": 5,
    "timeout": 2000
  },
  {
    "id": "Trigger2",
    "type": "MY_CUSTOM_EVENT2",
    "url": "https://httpbin.org/post",
    "retries": 5,
    "timeout": 2000
  }
]

export const fileStoreConfig = [
  {
    "enabled": true,
    "storeType": "amazon-s3",
    "bucket": "my-bucket",
    "conn": "us-east-1",
    "secret": "secrets.FileSecret.constants.json",
    "endpoint": "https://nyc3.digitaloceanspaces.com",
    "disableSSL": true,
    "forcePathStyle": true
  }
]

export const fileStoreRules = [
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
  }
]

export const ingressRoutes = [
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
        "host": "service1.mockproject1.svc.cluster.local",
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
        { "key": "headerKey1", "value": "headerValue1", "op": "add" },
        { "key": "headerKey2", "value": "headerValue2" }
      ],
      "resHeaders": [
        { "key": "headerKey1", "value": "headerValue1", "op": "del" },
        { "key": "headerKey2", "value": "headerValue2", "op": "set" }
      ],
      "outputFormat": "json",
      "requestTemplate": "{\"yo\": \"lo\"}"
    }
  }
]

export const ingressRoutesGlobal = [
  {
    "headers": [
      { "key": "globalHeader1", "value": "Global Header 1", "op": "add" },
      { "key": "globalHeader2", "value": "Global Header 2", "op": "set" }
    ],
    "resHeaders": [
      { "key": "globalHeader1", "value": "Global Header 1", "op": "del" },
      { "key": "globalHeader2", "value": "Global Header 2", "op": "set" }
    ]
  }
]

export const letsencryptConfig = [
  {
    domains: ["example.com"]
  }
]

export const remoteServices = [
  {
    "id": "auth",
    "url": "localhost:3000",
    "endpoints": {
      "login": {
        "method": "POST",
        "path": "/v1/login",
        "kind": "internal",
        "rule": {
          "rule": "allow"
        },
        "token": "eyJhbGciOiJIUzI1NiJ9.ewogICJyb2xlIjogInVzZXIiCn0.BSQNTIL1Ktox0H_qyj7UHYBGlz9PiF06kEqDZptFJFA",
        "headers": [
          { "key": "headerKey1", "value": "headerValue1", "op": "add" },
          { "key": "headerKey2", "value": "headerValue2", "op": "del" }
        ],
        "timeout": 100
      },
      "externalEndpoint": {
        "method": "GET",
        "path": "https://foo.com/bar",
        "kind": "external",
        "rule": {
          "rule": "authenticated"
        },
        "token": "eyJhbGciOiJIUzI1NiJ9.ewogICJyb2xlIjogInVzZXIiCn0.BSQNTIL1Ktox0H_qyj7UHYBGlz9PiF06kEqDZptFJFA",
        "requestTemplate": `{ "id": "args.id"}`,
        "responseTemplate": `{ "key1": "res.val1"}`
      },
      "preparedQuery": {
        "kind": "prepared",
        "rule": {
          "rule": "authenticated"
        },
        "outputFormat": "json",
        "token": "eyJhbGciOiJIUzI1NiJ9.ewogICJyb2xlIjogInVzZXIiCn0.BSQNTIL1Ktox0H_qyj7UHYBGlz9PiF06kEqDZptFJFA",
        "graphTemplate": `query { users @db }`,
        "requestTemplate": `{ "id": "args.id"}`,
        "responseTemplate": `{ "key1": "res.val1"}`
      },
    }
  }
]

export const services = [
  {
    "id": "service1",
    "version": "v1",
    "projectId": "todoapp",
    "autoScale": {
      "pollingInterval": 15,
      "coolDownInterval": 120,
      "replicas": 0,
      "minReplicas": 0,
      "maxReplicas": 10,
      "triggers": [
        {
          "name": "Scaler1",
          "type": "cpu",
          "metadata": { "type": "Utilization", "value": "50" },
        }
      ]
    },
    "labels": {
      "diskType": "ssd",
      "attrs": "label"
    },
    "tasks": [
      {
        "id": "task1",
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
    "affinity": [
      {
        "id": "123",
        "type": "node",
        "weight": 50,
        "operator": "preferred",
        "topologyKey": "kubernets.io/hostname",
        "projects": ["project1"],
        "matchExpressions": [
          {
            "key": "diskType",
            "attribute": "label",
            "operator": "In",
            "values": ["ssd"]
          }
        ]
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
    ],
    "statsInclusionPrefixes": "http.inbound,cluster_manager"
  },
  {
    "id": "service1",
    "version": "v2",
    "projectId": "todoapp",
    "autoScale": {
      "pollingInterval": 15,
      "coolDownInterval": 120,
      "replicas": 0,
      "minReplicas": 0,
      "maxReplicas": 100,
      "triggers": [{
        "name": "Scaler1",
        "type": "requests-per-second",
        "metadata": { "target": 50 }
      }]
    },
    "labels": {
      "diskType": "ssd",
      "attrs": "label"
    },
    "tasks": [
      {
        "id": "task1",
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
    "affinity": [
      {
        "id": "123",
        "type": "node",
        "weight": 50,
        "operator": "preferred",
        "topologyKey": "kubernets.io/hostname",
        "projects": ["project1"],
        "matchExpressions": [
          {
            "key": "diskType",
            "attribute": "label",
            "operator": "In",
            "values": ["ssd"]
          }
        ]
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
    ],
    "statsInclusionPrefixes": "http.inbound,cluster_manager"
  },
  {
    "id": "service2",
    "version": "v1",
    "projectId": "todoapp",
    "autoScale": {
      "pollingInterval": 15,
      "coolDownInterval": 120,
      "replicas": 0,
      "minReplicas": 0,
      "maxReplicas": 10,
      "triggers": [{
        "name": "Scaler1",
        "type": "azure-blob-storage",
        "metadata": { "k1": "v1", "k2": "v2" },
        "authRef": {
          "secretMapping": [
            { "param": "abc", "key": "secrets.EnvSecret.foo" },
            { "param": "xyz", "key": "secrets.EnvSecret.bar" }
          ]
        }
      }]
    },
    "labels": {
      "diskType": "ssd",
      "attrs": "label"
    },
    "tasks": [
      {
        "id": "task1",
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
    "affinity": [
      {
        "id": "123",
        "type": "node",
        "weight": 50,
        "operator": "preferred",
        "topologyKey": "kubernets.io/hostname",
        "projects": ["project1"],
        "matchExpressions": [
          {
            "key": "diskType",
            "attribute": "label",
            "operator": "In",
            "values": ["ssd"]
          }
        ]
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
    ],
    "statsInclusionPrefixes": "http.inbound,cluster_manager"
  }
]

export const deploymentsStatus = [
  {
    serviceId: "service1",
    version: "v1",
    desiredReplicas: 5,
    replicas: [
      { id: "replicaid1", status: deploymentStatuses.RUNNING },
      { id: "replicaid2", status: deploymentStatuses.PENDING },
      { id: "replicaid3", status: deploymentStatuses.FAILED },
      { id: "replicaid4", status: deploymentStatuses.SUCCEEDED },
      { id: "replicaid5", status: deploymentStatuses.UNKNOWN }
    ]
  }
]

export const serviceRoles = [
  {
    "id": "Role1",
    "type": "project",
    "project": "MockProject1",
    "service": "service1",
    "rules": [
      {
        "apiGroups": ["group1","rbac.authorization.io"],
        "verbs": ["get", "watch", "list"],
        "resources": ["pods", "configmaps"]
      }
    ]
  }
]

export const secrets = [
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
  },
  {
    "id": "Secret1",
    "type": "env",
    "data": {
      "abc": "abc",
      "xyz": "xyz"
    }
  }
]

export const userMan = [
  {
    id: "email",
    enabled: true
  }
]

export const clusterConfig = {
  "letsEncryptEmail": "admin@gmail.com",
  "enableTelemetry": true
}

export const permissions = [
  {
    project: "*",
    resource: "*",
    verb: "*"
  }
]

export const serviceRoutes = [
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

export const installedIntegrations = [
  {
    id: "teammanagement",
    name: "Team Management",
    description: "Enterprise grade team management module for granular login permissions and much more",
    details: "## Introduction\n This is a great integration",
    appUrl: "/integrations/team-management",
    healthCheckUrl: "/v1/integrations/health-check",
    configPermissions: [
      {
        resources: ["*"],
        verbs: ["hijack"]
      }
    ],
    apiPermissions: []
  }
]

export const supportedInterations = [
  {
    id: "teammanagement",
    name: "Team Management",
    description: "Enterprise grade team management module for granular login permissions and much more",
    details: "## Introduction\n This is a great integration",
    appUrl: "/integrations/team-management",
    healthCheckUrl: "/v1/integrations/health-check",
    configPermissions: [
      {
        resources: ["*"],
        verbs: ["hijack"]
      }
    ],
    apiPermissions: []
  },
  {
    id: "elasticsearch",
    name: "Elastic Search",
    description: "Enterprise grade team management module for granular login permissions and much more",
    details: "## Introduction\n This is a great integration",
    appUrl: "/integrations/elastic-search",
    configPermissions: [
      {
        resources: ["db-config", "db-schema"],
        verbs: ["read"]
      }
    ],
    apiPermissions: [
      {
        resources: ["db-read"],
        verbs: ["hijack", "access"]
      },
      {
        resources: ["db-create", "db-update", "db-delete"],
        verbs: ["hook"]
      }
    ]
  }
]

export const eventLogs = [
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

export const cacheConfig = [
  {
    "enabled": true,
    "conn": "my-redis.space-cloud.svc.cluster.local:6379",
    "defaultTTL": 2100
  }
]

export const addonsConfig = {
  rabbitmq: {
    "enabled": true,
    "resources": {
      "cpu": 1000,
      "memory": 100
    },
    "options": {
      "highAvailability": true
    }
  },
  redis: {
    "enabled": true,
    "resources": {
      "cpu": 1000,
      "memory": 100
    }
  }
}