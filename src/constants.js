export const dbTypes = {
  MONGO: "mongo",
  POSTGRESQL: "sql-postgres",
  MYSQL: "sql-mysql"
}

export const defaultDbConnectionStrings = {
  [dbTypes.MONGO]: "mongodb://localhost:27017",
  [dbTypes.POSTGRESQL]: "postgres://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable",
  [dbTypes.MYSQL]: "root:my-secret-pw@tcp(localhost:3306)/"
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
  service: String
  function: String
}`

