import store from "./store";
import { getProjectConfig } from "./utils";
import gql from "graphql-tag";
import gqlPrettier from 'graphql-prettier';
import { format } from 'prettier-package-json';

const getDefType = (type, isArray, required) => {
  isArray = isArray ? true : type.kind === "ListType";
  required = required ? true : type.kind === "NonNullType";
  if (type.type) {
    return getDefType(type.type, isArray, required);
  }
  return { isArray, fieldType: type.name.value, required };
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

const generateGraphQLArgsString = (args = []) => {
  if (args.length === 0) {
    return ""
  }
  const argsKeyValuePairs = args.map(arg => `${arg.name}: ${JSON.stringify(arg.value)}`)
  return `(${argsKeyValuePairs.join(",")})`
}

const generateFieldQuery = (field) => {
  const { name, args, directives = [], fields = []} = field
  const directivesString = directives.length === 0 ? "" : " " + directives.map(obj => `@${obj.name}${generateGraphQLArgsString(obj.args)}`).join(" ")
  let fieldString = `${name}${generateGraphQLArgsString(args)}${directivesString}`
  if (fields.length > 0) {
    fieldString = fieldString + `{
      ${fields.map(field => generateFieldQuery(field)).join("\n")}
    }`
  }
  return fieldString
}

// Removes all redundant commas and quotes from the GraphQL string
const removeRegex = (value, dataresponse) => {
  let removeOpeningComma = /\,(?=\s*?[\{\]])/g;
  let removeClosingComma = /\,(?=\s*?[\}\]])/g;
  let removeQuotes = /"([^"]+)"/g;
  value = value.replace(removeOpeningComma, '');
  value = value.replace(removeClosingComma, '');
  if (dataresponse) value = format(JSON.parse(value))
  else value = value.replace(removeQuotes, '$1')
  return value
}

export const generateGraphQLQueryFromGraphQLAST = (ast = { queryType: "query", fields: [] }) => {
  const query = `${ast.queryType} {
    ${ast.fields.map(field => generateFieldQuery(field)).join("\n")}
  }`

  let result = gqlPrettier(removeRegex(query, 0))
  if (ast.queryType === "query") {
    result = "query " + result
  }

  return result
}

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