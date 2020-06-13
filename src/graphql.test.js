import { generateSchemaAST, generateGraphQLQueryFromGraphQLAST, generateRandomFieldValues, generateSampleQueryDBDelete } from "./graphql";

describe("generateSchemaAST method", () => {
  it("generates correct schema AST from a GraphQL schema string", () => {
    const schemaString = `
    type mytype {
      f1: ID! @primary
      f2: String
      f3: Boolean
      f4: Float
      f5: Integer
      f6: DateTime
      f7: JSON
      f8: [ID]
      f9: [String]!
      f10: ID! @unique
      f11: Boolean @unique
      f12: DateTime! @createdAt
      f13: DateTime @updatedAt
      f14: mytype2
      f15: ID @foreign(table: mytype3, field: myfield)
      f16: String @link(table: mytype4, from: id, to: somefield, field: goodfield)
      f17: mytype5 @link(table: mytype5, from: id, to: nicefield)
      f18: [mytype6]! @link(table: mytype6, from: id, to: goodfield)      
    }
    `
    const expectedSchemaAST = {
      mytype: [
        {
          name: "f1",
          type: "ID",
          isRequired: true,
          isPrimary: true,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f2",
          type: "String",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f3",
          type: "Boolean",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f4",
          type: "Float",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f5",
          type: "Integer",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f6",
          type: "DateTime",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f7",
          type: "JSON",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f8",
          type: "ID",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: true,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f9",
          type: "String",
          isRequired: true,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: true,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f10",
          type: "ID",
          isRequired: true,
          isPrimary: false,
          hasUniqueConstraint: true,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f11",
          type: "Boolean",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: true,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f12",
          type: "DateTime",
          isRequired: true,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: true,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f13",
          type: "DateTime",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: true,
          hasNestedFields: false
        },
        {
          name: "f14",
          type: "mytype2",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: true
        },
        {
          name: "f15",
          type: "ID",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: true,
          foreign: {
            table: "mytype3",
            field: "myfield"
          },
          isLink: false,
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f16",
          type: "String",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: true,
          link: {
            table: "mytype4",
            from: "id",
            to: "somefield"
          },
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: false
        },
        {
          name: "f17",
          type: "mytype5",
          isRequired: false,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: true,
          link: {
            table: "mytype5",
            from: "id",
            to: "nicefield"
          },
          isArray: false,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: true
        },
        {
          name: "f18",
          type: "mytype6",
          isRequired: true,
          isPrimary: false,
          hasUniqueConstraint: false,
          hasForeignConstraint: false,
          isLink: true,
          link: {
            table: "mytype6",
            from: "id",
            to: "goodfield"
          },
          isArray: true,
          hasCreatedAtDirective: false,
          hasUpdatedAtDirective: false,
          hasNestedFields: true
        }
      ]
    }
    expect(generateSchemaAST(schemaString)).toEqual(expectedSchemaAST);
  });

  it("returns an empty object for empty schema string", () => {
    expect(generateSchemaAST('')).toEqual({})
    expect(generateSchemaAST()).toEqual({})
  })
});

describe("generateGraphQLQueryFromGraphQLAST method", () => {
  it("generates the correct graphql query string", () => {
    const ast1 = {
      queryType: "query",
      fields: [
        {
          name: "users",
          args: [
            { name: "where", value: { id: "$id", address: "$address" } },
            { name: "skip", value: "$skip" }
          ],
          directives: [
            { name: "db" }
          ],
          fields: [
            {
              name: "id"
            },
            {
              name: "name"
            }
          ]
        }
      ]
    }

    const queryString1 = `query {
  users(where: {id: $id, address: $address}, skip: $skip) @db {
    id
    name
  }
}`

    expect(generateGraphQLQueryFromGraphQLAST(ast1)).toEqual(queryString1)
  })
})

describe("generateRandomFieldValues method", () => {
  it("generates the values for nested fields", () => {
    const fields = [
      {
        name: "id",
        hasNestedFields: true,
        fields: [
          {
            name: "_eq",
            type: "ID"
          }
        ]
      }
    ]
    const result = {
      id: {
        _eq: "0ujsszwN8NRY24YaXiTIE2VWDTS"
      }
    }
    expect(generateRandomFieldValues(fields)).toEqual(result)
  })
  it("generates the values for array of literal values", () => {
    const fields = [
      {
        name: "id",
        type: "String",
        isArray: true
      }
    ]
    const result = {
      id: ["lorem ipsum"]
    }
    expect(generateRandomFieldValues(fields)).toEqual(result)
  })

  it("generates correct values for all types", () => {
    const fields = [
      {
        name: "k1",
        type: "ID"
      },
      {
        name: "k2",
        type: "String"
      },
      {
        name: "k3",
        type: "Integer"
      },
      {
        name: "k4",
        type: "Float"
      },
      {
        name: "k5",
        type: "Boolean"
      },
      {
        name: "k6",
        type: "DateTime"
      },
      {
        name: "k7",
        type: "JSON"
      },
    ]
    const result = {
      k1: "0ujsszwN8NRY24YaXiTIE2VWDTS",
      k2: "lorem ipsum",
      k3: 25,
      k4: 4.5,
      k5: true,
      k6: "2018-11-13T03:15:45.108Z",
      k7: {
        foo: "bar"
      }
    }
    expect(generateRandomFieldValues(fields)).toEqual(result)
  })
})

describe("generateSampleQueryDBDelete method", () => {
  it("generates proper delete query without filters", () => {
    const schemaASTs = {
      users: [
        {
          name: "id",
          type: "ID",
          isPrimary: true
        },
        {
          name: "name",
          type: "String",
          isPrimary: false
        },
        {
          name: "email",
          type: "ID",
          isPrimary: false,
          hasUniqueConstraint: true
        }
      ]
    }
    const result = {
      query: `mutation {
  delete_users @db {
    status
    error
  }
}`,
      variables: {},
      response: {
        data: {
          delete_users: {
            status: 200
          }
        }
      }
    }
    expect(generateSampleQueryDBDelete(schemaASTs, "users", "db", false)).toEqual(result)
  })

  it("generates proper delete query filters", () => {
    const schemaASTs = {
      users: [
        {
          name: "id",
          type: "ID",
          isPrimary: true
        },
        {
          name: "name",
          type: "String",
          isPrimary: false
        },
        {
          name: "email",
          type: "ID",
          isPrimary: false,
          hasUniqueConstraint: true
        }
      ]
    }
    const result = {
      query: `mutation {
  delete_users(where: {id: {_eq: $id}}) @db {
    status
    error
  }
}`,
      variables: {
        id: "0ujsszwN8NRY24YaXiTIE2VWDTS"
      },
      response: {
        data: {
          delete_users: {
            status: 200
          }
        }
      }
    }
    expect(generateSampleQueryDBDelete(schemaASTs, "users", "db", true)).toEqual(result)
  })
})