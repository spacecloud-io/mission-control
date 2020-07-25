export const endpointTypes = {
  INTERNAL: "internal",
  EXTERNAL: "external",
  PREPARED: "prepared"
}

export const configResourceTypeLabels = {
  "db-config": "Database config",
  "db-rule": "Database rules",
  "db-schema": "Database schema",
  "db-prepared-query": "Database prepared queries",
  "eventing-config": "Eventing config",
  "eventing-trigger": "Eventing triggers",
  "eventing-schema": "Eventing schema",
  "eventing-rule": "Eventing rules",
  "filestore-config": "Filestore config",
  "filestore-rule": "Filestore rules",
  "letsencrypt": "Letsencrypt",
  "project": "Project settings",
  "ingress-global": "Ingress global config",
  "ingress-route": "Ingress routes",
  "remote-service": "Remote services",
  "service": "Services",
  "service-route": "Service routes",
  "secret": "Secrets",
  "integration": "Integrations",
  "integration-hook": "Integration hooks",
}

export const apiResourceTypeLabels = {
  "db-create": "Database create",
  "db-read": "Database read",
  "db-update": "Database update",
  "db-delete": "Database delete",
  "db-aggregate": "Database aggregate",
  "db-prepared-sql": "Database prepared query",
  "eventing-trigger": "Custom events",
  "service-call": "Remote service"
}

export const dbTypes = {
  MONGO: "mongo",
  POSTGRESQL: "postgres",
  MYSQL: "mysql",
  SQLSERVER: "sqlserver",
  EMBEDDED: "embedded"
}

export const defaultDbConnectionStrings = {
  [dbTypes.MONGO]: "mongodb://localhost:27017",
  [dbTypes.POSTGRESQL]: "postgres://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable",
  [dbTypes.MYSQL]: "root:my-secret-pw@tcp(localhost:3306)/",
  [dbTypes.SQLSERVER]: "Data Source=localhost,1433;Initial Catalog=master;User ID=yourID;Password=yourPassword@#;",
  [dbTypes.EMBEDDED]: "embedded.db"
}

export const SPACE_CLOUD_USER_ID = "internal-sc-user"

export const securityRuleGroups = {
  DB_COLLECTIONS: "collections",
  DB_PREPARED_QUERIES: "prepared-queries",
  FILESTORE: "file-store",
  EVENTING: "eventing",
  REMOTE_SERVICES: "remote-services",
  INGRESS_ROUTES: "ingress-routes"
}

export const defaultDBRules = {
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
}

export const defaultFileRule = {
  create: {
    rule: "allow"
  },
  read: {
    rule: "allow"
  },
  delete: {
    rule: "allow"
  }
}

export const defaultEventRule = {
  rule: "allow"
}

export const defaultEndpointRule = {
  rule: "allow"
}

export const defaultIngressRoutingRule = {
  rule: "allow"
}

export const defaultPreparedQueryRule = {
  rule: "allow"
}
const getURL = (productionURL, developmentURL, mockURL) => {
  if (process.env.NODE_ENV === "production") {
    return productionURL
  }
/*   if (process.env.REACT_APP_DISABLE_MOCK === "true") {
    return developmentURL
  }
  return mockURL */
  return developmentURL
}

export const spaceCloudClusterOrigin = getURL(undefined, "http://localhost:4122", undefined)
export const spaceUpAPIGraphQLURL = getURL("https://api.spaceuptech.com/v1/api/spacecloud/graphql", "https://testing.spaceuptech.com/v1/api/spacecloud/graphql", "/v1/api/spacecloud/graphql")