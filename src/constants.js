export const fileStoreProviders = {
  LOCAL: "local",
  AMAZON_S3: "amazon-s3",
  GCP_STORAGE: "gcp-storage"
}

export const endpointTypes = {
  INTERNAL: "internal",
  EXTERNAL: "external",
  PREPARED: "prepared"
}

export const permissionVerbs = {
  READ: "read",
  MODIFY: "modify"
}

export const configResourceTypes = {
  DB_CONFIG: "db-config",
  DB_RULES: "db-rule",
  DB_SCHEMA: "db-schema",
  DB_PREPARED_QUERIES: "db-prepared-query",
  FILESTORE_CONFIG: "filestore-config",
  FILESTORE_RULES: "filestore-rule",
  CACHE_CONFIG: "cache-config",
  EVENTING_CONFIG: "eventing-config",
  EVENTING_TRIGGERS: "eventing-trigger",
  EVENTING_RULES: "eventing-rule",
  EVENTING_SCHEMA: "eventing-schema",
  REMOTE_SERVICES: "remote-service",
  SERVICES: "service",
  SERVICE_LOGS: "service-logs",
  SERVICE_ROUTES: "service-route",
  SERVICE_ROlES: "service-role",
  SECRETS: "secret",
  INGRESS_ROUTES: "ingress-route",
  INGRESS_GLOBAL: "ingress-global",
  USER_MANAGEMENT: "auth-provider",
  PROJECT_CONFIG: "project",
  CLUSTER_CONFIG: "cluster",
  LETSENCRYPT: "letsencrypt",
  INTEGRATIONS: "integration",
  INTEGRATION_HOOKS: "integration-hook"
}

export const apiResourceTypes = {
  DB_CREATE: "db-create",
  DB_READ: "db-read",
  DB_UPDATE: "db-update",
  DB_DELETE: "db-delete",
  DB_AGGREGATE: "db-aggregate",
  DB_PREPARED_QUERY: "db-prepared-query",
  EVENTING_QUEUE: "eventing-queue",
  EVENTING_LOGS: "eventing-logs",
  FILE_CREATE: "file-create",
  FILE_READ: "file-read",
  FILE_DELETE: "file-delete",
  SERVICE_CALL: "service-call",
  INTERNAL_API_ACCESS: "internal-api-access"
}

// These are UI modules/sections (sidenav items). These should not be confused with the space cloud modules 
export const projectModules = {
  OVERVIEW: "overview",
  DATABASE: "database",
  FILESTORE: "file-storage",
  CACHE: "cache",
  EVENTING: "eventing",
  REMOTE_SERVICES: "remote-services",
  DEPLOYMENTS: "deployments",
  SECRETS: "secrets",
  INGRESS_ROUTES: "ingress-routes",
  USER_MANAGEMENT: "auth-provider",
  INTEGRATIONS: "integrations",
  EXPLORER: "explorer",
  SETTINGS: "settings",
  SECURITY_RULES: "security-rules"
}

export const moduleResources = {
  [projectModules.OVERVIEW]: [],
  [projectModules.DATABASE]: [configResourceTypes.DB_CONFIG, configResourceTypes.DB_RULES, configResourceTypes.DB_SCHEMA, configResourceTypes.DB_PREPARED_QUERIES],
  [projectModules.FILESTORE]: [configResourceTypes.FILESTORE_CONFIG, configResourceTypes.FILESTORE_RULES],
  [projectModules.CACHE]: [],
  [projectModules.EVENTING]: [configResourceTypes.EVENTING_CONFIG, configResourceTypes.EVENTING_RULES, configResourceTypes.EVENTING_SCHEMA, configResourceTypes.EVENTING_TRIGGER],
  [projectModules.REMOTE_SERVICES]: [configResourceTypes.REMOTE_SERVICES],
  [projectModules.DEPLOYMENTS]: [configResourceTypes.SERVICES, configResourceTypes.SERVICE_ROUTES, configResourceTypes.SERVICE_ROlES],
  [projectModules.SECRETS]: [configResourceTypes.SECRETS],
  [projectModules.INGRESS_ROUTES]: [configResourceTypes.INGRESS_ROUTES, configResourceTypes.INGRESS_GLOBAL],
  [projectModules.USER_MANAGEMENT]: [configResourceTypes.USER_MANAGEMENT],
  [projectModules.INTEGRATIONS]: [],
  [projectModules.EXPLORER]: [],
  [projectModules.SETTINGS]: [],
  [projectModules.SECURITY_RULES]: []
}

export const configResourceTypeLabels = {
  [configResourceTypes.DB_CONFIG]: "Database config",
  [configResourceTypes.DB_RULES]: "Database rules",
  [configResourceTypes.DB_SCHEMA]: "Database schema",
  [configResourceTypes.DB_PREPARED_QUERIES]: "Database prepared queries",
  [configResourceTypes.FILESTORE_CONFIG]: "Filestore config",
  [configResourceTypes.FILESTORE_RULES]: "Filestore rules",
  [configResourceTypes.CACHE_CONFIG]: "Cache config",
  [configResourceTypes.EVENTING_CONFIG]: "Eventing config",
  [configResourceTypes.EVENTING_TRIGGERS]: "Eventing triggers",
  [configResourceTypes.EVENTING_SCHEMA]: "Eventing schema",
  [configResourceTypes.EVENTING_RULES]: "Eventing rules",
  [configResourceTypes.REMOTE_SERVICES]: "Remote services",
  [configResourceTypes.SERVICES]: "Services",
  [configResourceTypes.SERVICE_LOGS]: "Service logs",
  [configResourceTypes.SERVICE_ROUTES]: "Service routes",
  [configResourceTypes.SERVICE_ROlES]: "Service roles",
  [configResourceTypes.SECRETS]: "Secrets",
  [configResourceTypes.INGRESS_GLOBAL]: "Ingress global config",
  [configResourceTypes.INGRESS_ROUTES]: "Ingress routes",
  [configResourceTypes.USER_MANAGEMENT]: "User Management",
  [configResourceTypes.INTEGRATIONS]: "Integrations",
  [configResourceTypes.INTEGRATION_HOOKS]: "Integration hooks",
  [configResourceTypes.LETSENCRYPT]: "Letsencrypt",
  [configResourceTypes.PROJECT_CONFIG]: "Project config",
  [configResourceTypes.CLUSTER_CONFIG]: "Cluster config"
}

export const apiResourceTypeLabels = {
  [apiResourceTypes.DB_CREATE]: "Database create",
  [apiResourceTypes.DB_READ]: "Database read",
  [apiResourceTypes.DB_UPDATE]: "Database update",
  [apiResourceTypes.DB_DELETE]: "Database delete",
  [apiResourceTypes.DB_AGGREGATE]: "Database aggregate",
  [apiResourceTypes.DB_PREPARED_QUERY]: "Database prepared query",
  [apiResourceTypes.EVENTING_QUEUE]: "Queue Custom events",
  [apiResourceTypes.EVENTING_LOGS]: "View Custom events",
  [apiResourceTypes.FILE_CREATE]: "File create",
  [apiResourceTypes.FILE_READ]: "File read",
  [apiResourceTypes.FILE_DELETE]: "File delete",
  [apiResourceTypes.SERVICE_CALL]: "Remote service call",
  [apiResourceTypes.INTERNAL_API_ACCESS]: "Internal API access"
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
  [dbTypes.SQLSERVER]: "sqlserver://username:password@hostIP:1433?database=master",
  [dbTypes.EMBEDDED]: "embedded.db"
}

export const securityRuleGroups = {
  DB_COLLECTIONS: "collections",
  DB_PREPARED_QUERIES: "prepared-queries",
  FILESTORE: "file-store",
  EVENTING: "eventing",
  EVENTING_FILTERS: "eventing-filters",
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

export const defaultEventFilterRule = {
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

export const deploymentStatuses = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  RUNNING: "RUNNING",
  FAILED: "FAILED",
  UNKNOWN: "UNKOWN"
}

export const actionQueuedMessage = "Action queued successfully"

export const kedaTriggerTypes = [
  { label: "ActiveMQ Artemis", value: "artemis-queue" },
  { label: "Apache Kafka", value: "kafka" },
  { label: "AWS Cloud Watch", value: "aws-cloudwatch" },
  { label: "AWS Kinesis Stream", value: "aws-kinesis-stream" },
  { label: "AWS SQS Queue", value: "aws-sqs-queue" },
  { label: "Azure Blob Storage", value: "azure-blob" },
  { label: "Azure Event Hubs", value: "azure-eventhub" },
  { label: "Azure Log Analytics", value: "azure-log-analytics" },
  { label: "Azure Monitor", value: "azure-monitor" },
  { label: "Azure Service Bus", value: "azure-servicebus" },
  { label: "Azure Storage Queue", value: "azure-queue" },
  { label: "Cron", value: "cron" },
  { label: "External", value: "external" },
  { label: "External Push", value: "external-push" },
  { label: "Google Cloud Platform ‎Pub/Sub", value: "gcp-pubsub" },
  { label: "Huawei Cloudeye", value: "huawei-cloudeye" },
  { label: "Liiklus Topic", value: "liiklus" },
  { label: "Metrics API", value: "metric-api" },
  { label: "MySQL", value: "mysql" },
  { label: "NATS Streaming", value: "stan" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "Prometheus", value: "prometheus" },
  { label: "RabbitMQ Queue", value: "rabbitmq" },
  { label: "Redis Lists", value: "redis" },
  { label: "Redis Streams", value: "redis-streams" }
]

const getURL = (productionURL, developmentURL, mockURL) => {
  if (process.env.NODE_ENV === "production") {
    return productionURL
  }
  if (process.env.REACT_APP_ENABLE_MOCK === "true") {
    return mockURL
  }
  return developmentURL
}

export const spaceCloudClusterOrigin = getURL(undefined, "http://localhost:4122", undefined)
export const spaceUpAPIGraphQLURL = getURL("https://api.spaceuptech.com/v1/api/spacecloud/graphql", "https://testing.spaceuptech.com/v1/api/spacecloud/graphql", "/v1/api/spacecloud/graphql")