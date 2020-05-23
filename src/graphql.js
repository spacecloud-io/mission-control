const schemaASTs = {
	users: [
		{
			name: "id",
			type: "ID",
			isPrimary: true,
			hasUniqueKey: false,
			hasForeignKey: true,
			foreign: {
				table: "posts",
				field: "id"
			},
			hasLink: true,
			link: {
				table: "qwer",
				from: "id",
				to: "vbnjm"
			},
			isArray: true
		}
	]
};

const graphqlField = {
	name: "users",
	args: [
		{
			name: "where", 
			value: "$where"
		},
		{
			name: "limit",
			value: "$limit"
		}
	],
	directives: [
		{
			name: "mydb"
		}
	],
	fields: [graphqlField]
}
const graphqlQueryAST = {
	queryType: "query|mutation",
	rootFields: [graphqlField]
}

const  generateSchemaASTs = (schemaString) => schemaASTs
const generateDBSchemaASTs = (dbAliasName) => schemsASTs
const generateGraphQLQueryString = (graphqlQueryASt) => `
query {
	users (where: $where, limit: $limit) @mydb {
		id 
		name
		address  {

		}
	}

}
`

const deleteQueryString = `
mutation {
	delete_users  @mydb {
		status
		error
	}
}
`

const generateGraphQDeleteQuery = (schemaASTs, dbAliasName, schemaName, applyFilters) => ``