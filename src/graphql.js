import { generateId } from "./utils";
import gql from "graphql-tag";
import gqlPrettier from 'graphql-prettier';
import { format } from 'prettier-package-json';
import { LoremIpsum } from "lorem-ipsum";
const lorem = new LoremIpsum();

const primitiveTypes = ["ID", "String", "Float", "Integer", "Boolean", "DateTime", "JSON"]
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
  const hasNestedFields = !primitiveTypes.includes(fieldType)
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
      (ar) => ar.name.value === "field" ||  ar.name.value === "to"
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

// Generates a graphql string for a field along with its arguments and directives
const generateFieldQuery = (field) => {
  const { name, args, directives = [], fields = [] } = field
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

export const generateDBSchemaAST = (schemas) => {
  const schemaAST = Object.values(schemas).reduce((prev, curr) => {
    if (!curr) {
      return prev
    }
    return Object.assign({}, prev, generateSchemaAST(curr))
  }, {})
  return schemaAST
}

const generateRandomValue = (type) => {
  if (process.env.NODE_ENV === "test") {
    switch (type) {
      case "ID":
        return "0ujsszwN8NRY24YaXiTIE2VWDTS"
      case "String":
        return "lorem ipsum"
      case "Integer":
        return 25
      case "Float":
        return 4.5
      case "Boolean":
        return true
      case "DateTime":
        return "2017-11-13T03:15:45.108Z"
      case "JSON":
        return { foo: "bar" }
      default:
        return type
    }
  } else {
    switch (type) {
      case "ID":
        return generateId(6)
      case "String":
        return lorem.generateWords(2)
      case "Integer":
        return Math.ceil(Math.random() * 100)
      case "Float":
        return Number((Math.random() * 100).toFixed(2))
      case "Boolean":
        return true
      case "DateTime":
        return new Date().toISOString()
      case "JSON":
        return { foo: "bar" }
      default:
        return type
    }
  }
}

export const generateRandomFieldValues = (fields = []) => {
  return fields.reduce((prev, { name, type, isArray, hasNestedFields, fields }) => {
    if (hasNestedFields) {
      const value = generateRandomFieldValues(fields)
      return Object.assign({}, prev, {
        [name]: isArray ? [value] : value
      })
    }
    const value = generateRandomValue(type)
    return Object.assign({}, prev, {
      [name]: isArray ? [value] : value
    })
  }, {})
}

// Gets the primary fields. If no primary fields are present then it returns the unique fields.
const getPrimaryOrUniqueFields = (fields = []) => {
  const primaryFields = fields.filter(field => field.isPrimary)
  if (primaryFields.length > 0) {
    return primaryFields
  }
  return fields.filter(field => field.hasUniqueConstraint)
}

const generateWhereClause = (fields) => {
  const primaryFields = getPrimaryOrUniqueFields(fields)
  const clause = primaryFields.reduce((prev, { name, type }) => {
    return Object.assign({}, prev, {
      [name]: type === "JSON" ? { _contains: `$${name}` } : { _eq: `$${name}` }
    })
  }, {})
  const params = generateRandomFieldValues(primaryFields)
  return { clause, params }
}

export const generateSampleQueryDBDelete = (schemaASTs, schemaName, dbAliasName, applyFilters) => {
  let variables = {}
  let whereClause = {}
  let args = []
  const fields = schemaASTs[schemaName] ? schemaASTs[schemaName] : []

  if (applyFilters) {
    const res = generateWhereClause(fields)
    whereClause = res.clause
    variables = res.params
    args.push({
      name: "where",
      value: whereClause
    })
  }

  const graphQLRequestAST = {
    queryType: "mutation",
    fields: [
      {
        name: `delete_${schemaName}`,
        directives: [{ name: dbAliasName }],
        args: args,
        fields: [{ name: "status" }, { name: "error" }]
      }
    ]
  }
  const query = generateGraphQLQueryFromGraphQLAST(graphQLRequestAST)
  const response = {
    data: {
      [`delete_${schemaName}`]: {
        status: 200
      }
    }
  }
  return { query, variables, response }
}

const getInsertFields = (schemaASTs, schemaName, parentSchemaName, getAutoGeneratedFields) => {
  const fields = schemaASTs[schemaName] ? schemaASTs[schemaName] : []
  const insertableFields = fields.filter(field => {
    // Skip inserting a field in linked object if it can be auto filled from parent table because of foreign key 
    if (!getAutoGeneratedFields && parentSchemaName && field.hasForeignConstraint && field.foreign.table === parentSchemaName) {
      return false
    }

    // Skip inserting a linked field if it can't be auto inserted
    if (field.isLink) {
      if (!field.hasNestedFields) {
        return false
      }
      const linkedSchema = field.link.table
      const linkedFields = schemaASTs[linkedSchema] ? schemaASTs[linkedSchema] : []
      const linkedSchemaToField = field.link.to
      const linkedSchemaHasForeignKeyOnUs = linkedFields.find(f => f.name === linkedSchemaToField).hasForeignConstraint
      if (!linkedSchemaHasForeignKeyOnUs) {
        return false
      }
    }

    // Skip inserting a field with createdAt and updatedAt directive
    if (!getAutoGeneratedFields && (field.hasCreatedAtDirective || field.hasUpdatedAtDirective)) {
      return false
    }

    return true
  })

  // Fill in the linked fields in the insertable fields 
  const finalFields = insertableFields.map(field => {
    if (field.isLink) {
      return {
        name: field.name,
        hasNestedFields: true,
        fields: getInsertFields(schemaASTs, field.link.table, schemaName, getAutoGeneratedFields),
        isArray: field.isArray
      }
    }

    return {
      name: field.name,
      type: field.type,
      isArray: field.isArray
    }
  })

  return finalFields
}

export const generateSampleQueryDBInsert = (schemaASTs, schemaName, dbAliasName) => {
  const fieldsToBeInserted = getInsertFields(schemaASTs, schemaName, undefined, false)
  const insertedFields = getInsertFields(schemaASTs, schemaName, undefined, true)
  const docs = [generateRandomFieldValues(fieldsToBeInserted)]
  const insertedFieldValues = [generateRandomFieldValues(insertedFields)]
  const variables = { docs }
  const graphQLRequestAST = {
    queryType: "mutation",
    fields: [
      {
        name: `insert_${schemaName}`,
        directives: [{ name: dbAliasName }],
        args: [{ name: "docs", value: "$docs" }],
        fields: [{ name: "status" }, { name: "error" }, { name: "returning" }]
      }
    ]
  }
  const query = generateGraphQLQueryFromGraphQLAST(graphQLRequestAST)
  const response = {
    data: {
      [`insert_${schemaName}`]: {
        status: 200,
        returning: insertedFieldValues
      }
    }
  }
  return { query, variables, response }
}

const getReadFields = (schemaASTs, schemaName, schemasTraversed = {}) => {
  const fields = schemaASTs[schemaName] ? schemaASTs[schemaName] : []
  schemasTraversed[schemaName] = true
  // Fill in the linked fields
  const finalFields = fields.filter(field => !(field.hasNestedFields && schemasTraversed[field.type]))
    .filter(field => !(field.hasForeignConstraint && schemasTraversed[field.foreign.table]))
    .map(field => {
      if (field.hasNestedFields) {
        return {
          name: field.name,
          hasNestedFields: true,
          fields: getReadFields(schemaASTs, field.type, schemasTraversed),
          isArray: field.isArray
        }
      }

      return {
        name: field.name,
        type: field.type,
        isArray: field.isArray
      }
    })

  return finalFields
}

export const generateSampleQueryDBRead = (schemaASTs, schemaName, dbAliasName, applyFilters, sort, skip, limit) => {
  let variables = {}
  let whereClause = {}
  let args = []
  const fields = schemaASTs[schemaName] ? schemaASTs[schemaName] : []

  if (applyFilters) {
    const res = generateWhereClause(fields)
    whereClause = res.clause
    variables = Object.assign(variables, res.params)
    args.push({
      name: "where",
      value: whereClause
    })
  }

  if (sort) {
    const sortWeight = {
      ID: 0,
      Integer: 1,
      Float: 2,
      DateTime: 3
    }
    const sortFields = fields.filter(field => !field.isPrimary && ["ID", "Integer", "Float", "DateTime"].includes(field.type) && !field.isArray)
      .sort((a, b) => sortWeight[a.type] - sortWeight[b.type])
      .slice(0, 2)
      .map(field => field.name)
    variables = Object.assign(variables, { sort: sortFields })
    args.push({
      name: "sort",
      value: "$sort"
    })
  }

  if (skip) {
    variables = Object.assign(variables, { skip: 20 })
    args.push({
      name: "skip",
      value: "$skip"
    })
  }

  if (limit) {
    variables = Object.assign(variables, { limit: 10 })
    args.push({
      name: "limit",
      value: "$limit"
    })
  }

  const selectionSet = getReadFields(schemaASTs, schemaName)
  const selectionSetValue = [generateRandomFieldValues(selectionSet)]

  const graphQLRequestAST = {
    queryType: "query",
    fields: [
      {
        name: schemaName,
        directives: [{ name: dbAliasName }],
        args: args,
        fields: selectionSet
      }
    ]
  }
  const query = generateGraphQLQueryFromGraphQLAST(graphQLRequestAST)
  const response = {
    data: {
      [schemaName]: selectionSetValue
    }
  }
  return { query, variables, response }
}

export const generateSampleQueryDBUpdate = (schemaASTs, schemaName, dbAliasName, applyFilters, upsert) => {
  let variables = {}
  let whereClause = {}
  let args = []
  const fields = schemaASTs[schemaName] ? schemaASTs[schemaName] : []

  if (applyFilters) {
    const res = generateWhereClause(fields)
    whereClause = res.clause
    variables = Object.assign(variables, res.params)
    args.push({
      name: "where",
      value: whereClause
    })
  }

  args.push({
    name: "set",
    value: "$set"
  })

  if (upsert) {
    args.push({
      name: "op",
      value: "upsert"
    })
  }

  const graphQLRequestAST = {
    queryType: "mutation",
    fields: [
      {
        name: `update_${schemaName}`,
        directives: [{ name: dbAliasName }],
        args: args,
        fields: [{ name: "status" }, { name: "error" }]
      }
    ]
  }

  const setFields = fields.filter(field => primitiveTypes.includes(field.type) && !field.hasUpdatedAtDirective && !field.hasCreatedAtDirective
    && !field.hasForeignConstraint && !field.isPrimary && !field.hasUniqueConstraint)
  const setFieldsValue = generateRandomFieldValues(setFields)
  variables = Object.assign(variables, { set: setFieldsValue })

  const query = generateGraphQLQueryFromGraphQLAST(graphQLRequestAST)
  const response = {
    data: {
      [`update_${schemaName}`]: {
        status: 200
      }
    }
  }
  return { query, variables, response }
}