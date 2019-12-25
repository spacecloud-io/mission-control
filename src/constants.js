export const dbTypes = {
  MONGO: "mongo",
  POSTGRESQL: "postgres",
  MYSQL: "mysql",
  SQLSERVER: "sqlserver"
}

export const defaultDbConnectionStrings = {
  [dbTypes.MONGO]: "mongodb://localhost:27017",
  [dbTypes.POSTGRESQL]: "postgres://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable",
  [dbTypes.MYSQL]: "root:my-secret-pw@tcp(localhost:3306)/",
  [dbTypes.SQLSERVER]: "Data Source=localhost,1433;Initial Catalog=master;User ID=yourID;Password=yourPassword@#;"
}

export const SPACE_CLOUD_USER_ID = "internal-sc-user"

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

export const eventLogsSchema = `type event_logs {
  _id: ID! @primary
  batchid: String
  type: String
  token: Integer
  timestamp: Integer
  event_timestamp: Integer
  payload: String
  status: String
  retries: Integer
  url: String
  remark: String
}`

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

export const defaultFileRootPathRule = {
  prefix: "/",
  rule: defaultFileRule
}

export const defaultEndpointRule = {
  rule: "allow"
}
