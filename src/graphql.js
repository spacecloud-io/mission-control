import store from "./store";
import { getProjectConfig } from "./utils";
import gql from "graphql-tag";

const getDefType = (type, isArray, required) => {
  isArray = isArray ? true : type.kind === "ListType";
  required = required ? true: type.kind === "NonNullType"; 
  if (type.type) {
    return getDefType(type.type, isArray, required);
  }
  return { isArray, fieldType: type.name.value, required};
};

const generateSchemaASTFromGraphQLSchemaDefinition = (def) => {
  const { isArray, fieldType, required } = getDefType(def.type);
  const directives = def.directives;
  const isPrimary = directives.some((dir) => dir.name.value === "primary");
  const isLink = directives.some((dir) => dir.name.value === "link");
  const hasForeignConstraint = directives.some((dir) => dir.name.value === "foreign");
  const hasUniqueConstraint = directives.some((dir) => dir.name.value === "unique");
  const hasNestedFields = !["ID", "String", "Float", "Integer", "Boolean", "DateTime", "JSON"].includes(fieldType)
  const hasCreatedAtDirective = directives.some((dir) => dir.name.value === "createdAt");
  const hasUpdatedAtDirective = directives.some((dir) => dir.name.value === "updatedAt");
  let foreignTable = null, foreignField = null;
  if (hasForeignConstraint) {
    const foreignDirective = directives.find(
      (dir) => dir.name.value === "foreign"
    );
    const tableArgument = foreignDirective.arguments.find(
      (ar) => ar.name.value === "table"
    );
    const fieldArgument = foreignDirective.arguments.find(
      (ar) => ar.name.value === "field"
    );
    foreignTable = tableArgument.value.value;
    foreignField = fieldArgument.value.value;
  }
  let linkTable = null, linkFrom = null, linkTo = null;
  if (isLink) {
    const linkDirective = directives.find((dir) => dir.name.value === "link");
    const tableArgument = linkDirective.arguments.find(
      (ar) => ar.name.value === "table"
    );
    const fromArgument = linkDirective.arguments.find(
      (ar) => ar.name.value === "from"
    );
    const toArgument = linkDirective.arguments.find(
      (ar) => ar.name.value === "to"
    );
    linkTable = tableArgument.value.value;
    linkFrom = fromArgument.value.value;
    linkTo = toArgument.value.value;
  }
  return {
    name: def.name.value,
    type: fieldType,
    isArray: isArray,
    isRequired: required,
    isPrimary: isPrimary,
    hasNestedFields: hasNestedFields,
    hasUniqueConstraint: hasUniqueConstraint,
    hasForeignConstraint: hasForeignConstraint,
    foreign: hasForeignConstraint ? {
      table: foreignTable,
      field: foreignField,
    } : undefined,
    isLink: isLink,
    link: isLink ? {
      table: linkTable,
      from: linkFrom,
      to: linkTo,
    } : undefined,
    hasCreatedAtDirective,
    hasUpdatedAtDirective
  };
};

export const generateSchemaAST = (schemaString) => {
  if (!schemaString) return {}
  const definitions = gql(schemaString).definitions.filter(
    (obj) => obj.kind === "ObjectTypeDefinition"
  );
  const schemaAST = definitions.reduce((prev, def) => {
    return Object.assign(prev, {
      [def.name.value]: def.fields
        .filter(def => def.kind === "FieldDefinition")
        .map(obj => generateSchemaASTFromGraphQLSchemaDefinition(obj))
    })
  }, {});
  return schemaAST;
};

export const generateDBSchemaAST = (dbAliasName, projectID) => {
  const collections = getProjectConfig(store.getState().projects, projectID, `modules.db.${dbAliasName}.collections`, {});
  const schemaAST = Object.values(collections).reduce((prev, { schema }) => {
    if (!schema) {
      return prev
    }
    return Object.assign(prev, generateSchemaAST(schema))
  }, {})
  return schemaAST
}

export const generateGraphqlASTs = (schemaString, dbAliasName, queryType) => {
  const def = gql(schemaString).definitions.filter(
    (obj) => obj.kind === "ObjectTypeDefinition"
  );
  const graphqlField = {
    name: def.name.value,
    args: [
      {
        name: "where",
        value: "$where"
      },
      {
        name: "limit",
        value: "$limit"
      },
      {
        name: "limit",
        value: "$limit"
      },
      {
        name: "docs",
        value: "$docs"
      }
    ],
    directives: [
      {
        name: dbAliasName
      }
    ],
    fields: [graphqlField]
  }
  return {
    queryType: queryType,
    rootFields: [graphqlField]
  }

} 