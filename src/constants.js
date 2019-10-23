export const dbTypes = {
  MONGO: "mongo",
  POSTGRESQL: "sql-postgres",
  MYSQL: "sql-mysql"
}

export const defaultDbConnectionStrings = {
  [dbTypes.MONGO]: "mongodb://localhost:27017",
  [dbTypes.POSTGRESQL]: "postgres://postgres:mysecretpassword@localhost/postgres?sslmode=disable",
  [dbTypes.MYSQL]: "root:my-secret-pw@tcp(localhost:3306)/"
}

export const SPACE_CLOUD_USER_ID = "internal-sc-user"

