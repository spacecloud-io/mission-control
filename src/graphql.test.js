import { generateSchemaAST, generateGraphQLQueryFromGraphQLAST, generateRandomFieldValues, generateSampleQueryDBDelete, generateSampleQueryDBInsert, generateDBSchemaAST, generateSampleQueryDBRead, generateSampleQueryDBUpdate } from "./graphql";

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
      f16: ID @foreign(table: mytype3, to: myfield)
      f17: String @link(table: mytype4, from: id, to: somefield, field: goodfield)
      f18: mytype5 @link(table: mytype5, from: id, to: nicefield)
      f19: [mytype6]! @link(table: mytype6, from: id, to: goodfield)
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
          name: "f17",
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
          name: "f18",
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
          name: "f19",
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

  it("generates the values for array of objects", () => {
    const fields = [
      {
        name: "posts",
        hasNestedFields: true,
        fields: [
          {
            name: "title",
            type: "String"
          }
        ],
        isArray: true
      }
    ]
    const result = {
      posts: [{ title: "lorem ipsum" }]
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
      k6: "2017-11-13T03:15:45.108Z",
      k7: {
        foo: "bar"
      }
    }
    expect(generateRandomFieldValues(fields)).toEqual(result)
  })
})

describe("generateSampleQueryDBDelete method", () => {
  it("generates proper delete query without filters", () => {
    const collections = {
      users: `type users {
        id: ID! @primary
        name: String
        email: ID! @unique
      }`
    }
    const schemaASTs = generateDBSchemaAST(collections)
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
    const collections = {
      users: `type users {
        id: ID! @primary
        name: String
        email: ID! @unique
      }`
    }
    const schemaASTs = generateDBSchemaAST(collections)
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

describe("generateSampleQueryDBInsert method", () => {
  it("generates proper insert query for table with linked inserts", () => {
    const collections = {
      authors: `type authors {
        id: ID! @primary
        name: String
        posts: [posts] @link(table: posts, from: id, to: author_id)
      }`,
      posts: `type posts {
        id: ID! @primary
        title: String
        author_id: ID! @foreign(table: authors, field: id)
        created_on: DateTime! @createdAt
        last_updated: DateTime! @updatedAt
        author: authors @link(table: authors, from: author_id, to: id)
      }`
    }

    const schemaASTs = generateDBSchemaAST(collections)
    const result = {
      query: `mutation {
  insert_authors(docs: $docs) @db {
    status
    error
    returning
  }
}`,
      variables: {
        docs: [
          {
            id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
            name: "lorem ipsum",
            posts: [
              {
                id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
                title: "lorem ipsum"
              }
            ]
          }
        ]
      },
      response: {
        data: {
          insert_authors: {
            status: 200,
            returning: [
              {
                id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
                name: "lorem ipsum",
                posts: [
                  {
                    id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
                    title: "lorem ipsum",
                    author_id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
                    created_on: "2017-11-13T03:15:45.108Z",
                    last_updated: "2017-11-13T03:15:45.108Z"
                  }
                ]
              }
            ]
          }
        }
      }
    }
    const actualResult = generateSampleQueryDBInsert(schemaASTs, "authors", "db")
    expect(actualResult).toEqual(result)
  })
  it("generates proper insert query for table that has foreign key and read only link on others table", () => {
    const collections = {
      authors: `type authors {
        id: ID! @primary
        name: String
        posts: [posts] @link(table: posts, from: id, to: author_id)
      }`,
      posts: `type posts {
        id: ID! @primary
        title: String
        author_id: ID! @foreign(table: authors, field: id)
        created_on: DateTime! @createdAt
        last_updated: DateTime! @updatedAt
        author: authors @link(table: authors, from: author_id, to: id)
      }`
    }

    const schemaASTs = generateDBSchemaAST(collections)
    const result = {
      query: `mutation {
  insert_posts(docs: $docs) @db {
    status
    error
    returning
  }
}`,
      variables: {
        docs: [
          {
            id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
            title: "lorem ipsum",
            author_id: "0ujsszwN8NRY24YaXiTIE2VWDTS"
          }
        ]
      },
      response: {
        data: {
          insert_posts: {
            status: 200,
            returning: [
              {
                id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
                title: "lorem ipsum",
                author_id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
                created_on: "2017-11-13T03:15:45.108Z",
                last_updated: "2017-11-13T03:15:45.108Z"
              }
            ]
          }
        }
      }
    }
    const actualResult = generateSampleQueryDBInsert(schemaASTs, "posts", "db")
    expect(actualResult).toEqual(result)
  })
})

describe("generateSampleQueryDBRead method", () => {
  it("generates proper read query for 1 to many relation", () => {
    const collections = {
      authors: `type authors {
        id: ID! @primary
        name: String
        email: ID!
        posts: [posts] @link(table: posts, from: id, to: author_id)
        joined_on: DateTime! @createdAt
      }`,
      posts: `type posts {
        id: ID! @primary
        title: String
        author_id: ID! @foreign(table: authors, field: id)
        created_on: DateTime! @createdAt
        last_updated: DateTime! @updatedAt
        author: authors @link(table: authors, from: author_id, to: id)
      }`
    }
    const schemaASTs = generateDBSchemaAST(collections)
    const result = {
      query: `query {
  authors(where: {id: {_eq: $id}}, sort: $sort, skip: $skip, limit: $limit) @db {
    id
    name
    email
    posts {
      id
      title
      created_on
      last_updated
    }
    joined_on
  }
}`,
      variables: {
        id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
        sort: ["email", "joined_on"],
        skip: 20,
        limit: 10
      },
      response: {
        data: {
          authors: [
            {
              id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
              name: "lorem ipsum",
              email: "0ujsszwN8NRY24YaXiTIE2VWDTS",
              posts: [
                {
                  id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
                  title: "lorem ipsum",
                  created_on: "2017-11-13T03:15:45.108Z",
                  last_updated: "2017-11-13T03:15:45.108Z"
                }
              ],
              joined_on: "2017-11-13T03:15:45.108Z"
            }
          ]
        }
      }
    }
    expect(generateSampleQueryDBRead(schemaASTs, "authors", "db", true, true, true, true)).toEqual(result)
  })

  it("generates proper read query for many to many relation", () => {
    const collections = {
      authors: `type authors {
        id: ID! @primary
        name: String
        email: ID!
        posts: [posts] @link(table: authors_posts, field: posts, from: id, to: authors_id)
        joined_on: DateTime! @createdAt
      }`,
      posts: `type posts {
        id: ID! @primary
        title: String
        author_id: ID! @foreign(table: authors, field: id)
        created_on: DateTime! @createdAt
        last_updated: DateTime! @updatedAt
        authors: [authors] @link(table: authors_posts, field: authors, from: id, to: posts_id)
      }`,
      authors_posts: `type authors_posts {
        id: ID!
        author_id: ID! @foreign(table: authors, field: id)
        posts_id: ID! @foreign(table: posts, field: id)
        posts: [posts] @link(table: posts, from: posts_id, to: id)
        authors: [authors] @link(table: authors, from: authors_id, to: id) 
      }`
    }
    const schemaASTs = generateDBSchemaAST(collections)
    const result = {
      query: `query {
  authors(where: {id: {_eq: $id}}, sort: $sort, skip: $skip, limit: $limit) @db {
    id
    name
    email
    posts {
      id
      title
      created_on
      last_updated
    }
    joined_on
  }
}`,
      variables: {
        id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
        sort: ["email", "joined_on"],
        skip: 20,
        limit: 10
      },
      response: {
        data: {
          authors: [
            {
              id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
              name: "lorem ipsum",
              email: "0ujsszwN8NRY24YaXiTIE2VWDTS",
              posts: [
                {
                  id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
                  title: "lorem ipsum",
                  created_on: "2017-11-13T03:15:45.108Z",
                  last_updated: "2017-11-13T03:15:45.108Z"
                }
              ],
              joined_on: "2017-11-13T03:15:45.108Z"
            }
          ]
        }
      }
    }
    expect(generateSampleQueryDBRead(schemaASTs, "authors", "db", true, true, true, true)).toEqual(result)
  })
})

describe("generateSampleQueryDBUpdate method", () => {
  it("generates proper upsert query", () => {
    const collections = {
      authors: `type authors {
          id: ID! @primary
          name: String
          email: ID! @unique
          joined_on: DateTime! @createdAt
          last_updated: DateTime! @updatedAt
          address: JSON
          posts: [posts] @link(table: posts, from: id, to: author_id)
        }`,
      posts: `type posts {
        id: ID! @primary
        title: String
        author_id: ID! @foreign(table: authors, field: id)
        created_on: DateTime! @createdAt
        last_updated: DateTime! @updatedAt
        author: authors @link(table: authors, from: author_id, to: id)
      }`
    }

    const schemaASTs = generateDBSchemaAST(collections)
    const result = {
      query: `mutation {
  update_authors(where: {id: {_eq: $id}}, set: $set, op: upsert) @db {
    status
    error
  }
}`,
      variables: {
        id: "0ujsszwN8NRY24YaXiTIE2VWDTS",
        set: {
          name: "lorem ipsum",
          address: {
            foo: "bar"
          }
        }
      },
      response: {
        data: {
          update_authors: {
            status: 200
          }
        }
      }
    }
    const actualResult = generateSampleQueryDBUpdate(schemaASTs, "authors", "db", true, true)
    expect(actualResult).toEqual(result)
  })
})
