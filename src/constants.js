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

export const defaultFileRootPathRule = {
  prefix: "/",
  rule: defaultFileRule
}

export const defaultEndpointRule = {
  rule: "allow"
}

export const spaceCloudClusterOrigin = process.env.NODE_ENV !== "production" ? "http://localhost:4122": undefined
export const enterpriseServerGraphQLURL = process.env.NODE_ENV !== "production" ? "http://35.188.208.249/v1/api/spacecloud/graphql": "https://api.spaceuptech.com/v1/api/spacecloud/graphql"