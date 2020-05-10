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

const getURL = (productionURL, developmentURL, mockURL) => {
  if (process.env.NODE_ENV === "production") {
    return productionURL
  }
  if (process.env.REACT_APP_DISABLE_MOCK === "true") {
    return developmentURL
  }
  return mockURL
}

export const spaceCloudClusterOrigin = getURL(undefined, "http://localhost:4122", undefined)
export const enterpriseServerGraphQLURL = getURL("https://api.spaceuptech.com/v1/api/spacecloud/graphql", "http://35.188.208.249/v1/api/spacecloud/graphql", "/v1/api/spacecloud/graphql")