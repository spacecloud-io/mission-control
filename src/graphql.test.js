import { generateSchemaAST } from "./graphql";

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