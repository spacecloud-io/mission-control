import store from "./store";
import { getProjectConfig, getSchema } from "./utils";
import gql from "graphql-tag";
// import { useParams } from "react-router-dom";

// const { projectID } = useParams();

const getDefType = (type, isArray) => {
  isArray = isArray ? true : type.kind === "ListType";
  if (type.type) {
    return getDefType(type.type, isArray);
  }
  return { isArray, fieldType: type.name.value };
};

const generateSchemaASTs = (def) => {
  // console.log(def);
  const { isArray, fieldType } = getDefType(def.type);
  const directives = def.directives;
  const isPrimaryField = directives.some((dir) => dir.name.value === "primary");
  const hasForeignKey = directives.some((dir) => dir.name.value === "foreign");
  const hasUniqueKey = directives.some((dir) => dir.name.value === "unique");
  let Foreigntable = null,
    Foreignfield = null;
  if (hasForeignKey) {
    const foreignDirective = directives.find(
      (dir) => dir.name.value === "foreign"
    );
    const tableArgument = foreignDirective.arguments.find(
      (ar) => ar.name.value === "table"
    );
    const fieldArgument = foreignDirective.arguments.find(
      (ar) => ar.name.value === "field"
    );
    Foreigntable = tableArgument.value.value;
    Foreignfield = fieldArgument.value.value;
  }
  let hasLink = false;
  if (
    fieldType !== "ID" &&
    fieldType !== "String" &&
    fieldType !== "Integer" &&
    fieldType !== "Float" &&
    fieldType !== "Boolean" &&
    fieldType !== "DateTime" &&
    fieldType !== "JSON"
  ) {
    hasLink = true;
  }
  let Linktable = null,
    Linkfrom = null,
    Linkto = null;
  if (hasLink) {
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
    Linktable = tableArgument.value.value;
    Linkfrom = fromArgument.value.value;
    Linkto = toArgument.value.value;
  }
  return {
    name: def.name.value,
    type: fieldType,
    isArray: isArray,
    isPrimaryField: isPrimaryField,
    hasUniqueKey: hasUniqueKey,
    hasForeignKey: hasForeignKey,
    foreign: {
      table: Foreigntable,
      field: Foreignfield,
    },
    hasLink: hasLink,
    link: {
      table: Linktable,
      from: Linkfrom,
      to: Linkto,
    },
  };
};

export const getSchema1 = (schemaString) => {
  let schemaAST = {};
  // console.log(schemaString);
  const definitions = gql(schemaString).definitions.filter(
    (obj) => obj.kind === "ObjectTypeDefinition"
  );
  definitions.forEach((def) => {
    return (schemaAST[def.name.value] = def.fields
      .filter((def) => def.kind === "FieldDefinition")
      .map((obj) => generateSchemaASTs(obj)));
  });
  console.log(schemaAST);
  return schemaAST;
};

export const generateDBSchemaASTs = (dbAliasName, projectID) => {
  const collections = getProjectConfig(store.getState().projects, projectID,`modules.db.${dbAliasName}.collections`, {});
  let schemaASTs = []
  console.log(collections);
  Object.entries(collections).forEach(([_, { schema }]) => {
    console.log(schema);
    if (schema) {
      console.log(getSchema1(schema));
      schemaASTs.push(getSchema1(schema))
      console.log(schemaASTs);
    }
  })
  return schemaASTs
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
      }
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