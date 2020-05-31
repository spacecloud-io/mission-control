import { generateSchemaASTs, getSchema1 } from "./graphql";

// Generate SchemASTs test
describe("getSchema1 method", () => {
  it("get schemaASTs1 from schemaString1", () => {
    const schemaString1 =
      "type users {\n  id: ID! @primary\n  email: ID!\n  name: String!\n  pass: String!\n  role: String!\n}";

    const expectedSchemaASTs1 = {
      users: [
        {
          name: "id",
          type: "ID",
          isPrimaryField: true,
          hasUniqueKey: false,
          hasForeignKey: false,
          hasLink: false,
          isArray: false,
        },
        {
          name: "email",
          type: "ID",
          isPrimaryField: false,
          hasUniqueKey: false,
          hasForeignKey: false,
          hasLink: false,
          isArray: false,
        },
        {
          name: "name",
          type: "String",
          isPrimaryField: false,
          hasUniqueKey: false,
          hasForeignKey: false,
          hasLink: false,
          isArray: false,
        },
        {
          name: "pass",
          type: "String",
          isPrimaryField: false,
          hasUniqueKey: false,
          hasForeignKey: false,
          hasLink: false,
          isArray: false,
        },
        {
          name: "role",
          type: "String",
          isPrimaryField: false,
          hasUniqueKey: false,
          hasForeignKey: false,
          hasLink: false,
          isArray: false,
        },
      ],
    };

    expect(getSchema1(schemaString1)).toEqual(expectedSchemaASTs1);
  });

  it("get schemaASTs2 from schemaString2", () => {
    const schemaString2 =
      "type post {\n   id: ID! @primary\n  title: String!\n  text: String!\n category: String\n  is_published: Boolean!\n  published_date: DateTime\n}";

    const expectedSchemaASTs2 = {
      post: [
      {
        name: "id",
        type: "ID",
        isPrimaryField: true,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "title",
        type: "String",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "text",
        type: "String",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "category",
        type: "String",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "is_published",
        type: "Boolean",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "published_date",
        type: "DateTime",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
    ]
  }
    expect(getSchema1(schemaString2)).toEqual(expectedSchemaASTs2);
  });

  it("get schemaASTs3 from schemaString3", () => {
    const schemaString3 =
      'type trainer {\n  id: ID! @primary\n  name: String!\n  pokemons: [pokemon] @link(table: "pokemon", from: "id", to: "trainer_id")\n}';

    const expectedSchemaASTs3 = {
    trainer: [
      {
        name: "id",
        type: "ID",
        isPrimaryField: true,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "name",
        type: "String",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "pokemons",
        type: "pokemon",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: true,
        hasLink: {
          table: "pokemon",
          from: "id",
          to: "trainer_id",
        },
        isArray: true,
      },
    ]
  };
    expect(getSchema1(schemaString3)).toEqual(expectedSchemaASTs3);
  });

  it("get schemaASTs4 from schemaString4", () => {
    const schemaString4 =
      'type pokemon {\n  id: ID! @primary\n  name: String!\n  trainer_id: ID! @foreign(table: "trainer", field: "id")\n}';

    const expectedSchemaASTs4 = {
    pokemon: [
      {
        name: "id",
        type: "ID",
        isPrimaryField: true,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "name",
        type: "String",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "trainer_id",
        type: "ID",
        isPrimaryField: true,
        hasUniqueKey: false,
        hasForeignKey: true,
        foreign: {
          table: "trainer",
          field: "id",
        },
        hasLink: false,
        isArray: false,
      },
    ]
  }
    expect(getSchema1(schemaString4)).toEqual(expectedSchemaASTs4);
  });

  it("get schemaASTs5 from schemaString5", () => {
    const schemaString5 =
      'type users {\n  id: ID!\n  name: String! @unique\n  text: String!\n  number: Int\n  is_published: Boolean!\t\n  trainer_id: ID! @link(table: "publisher", from: "id", to: "name")\n}\n';

    const expectedSchemaASTs5 = {
    users: [
      {
        name: "id",
        type: "ID",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "name",
        type: "String",
        isPrimaryField: false,
        hasUniqueKey: true,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "text",
        type: "String",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "number",
        type: "Int",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "is_published",
        type: "Boolean",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: false,
      },
      {
        name: "trainer_id",
        type: "ID",
        isPrimaryField: false,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: true,
        link: {
          table: "publisher",
          from: "id",
          to: "name",
        },
        isArray: false,
      },
      
    ]
  }
    expect(getSchema1(schemaString5)).toEqual(expectedSchemaASTs5);
  });
});

// Generate Graphql string test
describe("generateGraphQDeleteQuery method", () => {
  it("get graphqlString1 from schemaASTs1", () => {
    const schemaASTs1 = [
      {
        name: "id",
        type: "ID",
        isPrimaryField: true,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: true,
      },
    ];

    const expectedString1 =
      'mutation {\n  delete_users(where: $where) @postgres {\n    status\n    error\n  }\n}';

    expect(generateGraphQDeleteQuery(schemaASTs1)).toEqual(expectedString1);
  });

  it("get graphqlString2 from schemaASTs2", () => {
    const schemaASTs2 = [
      {
        name: "id",
        type: "ID",
        isPrimaryField: true,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: false,
        isArray: true,
      },
    ];

    const expectedString2 =
      'mutation {\n  delete_users(where: $where) @postgres {\n    status\n    error\n  }\n}';

    expect(generateGraphQDeleteQuery(schemaASTs2)).toEqual(expectedString2);
  });

  it("get graphqlString3 from schemaASTs3", () => {
    const schemaASTs3 = [
      {
        name: "id",
        type: "ID",
        isPrimary: true,
        hasUniqueKey: false,
        hasForeignKey: false,
        hasLink: true,
        link: {
          table: "pokemon",
          from: "id",
          to: "trainer_id",
        },
        isArray: true,
      },
    ];

    const expectedString3 =
      'mutation {\n delete_users(where: $where) @postgres {\n status\n  error\n }\n}';

    expect(generateGraphQDeleteQuery(schemaASTs3)).toEqual(expectedString3);
  });

  it("get graphqlString4 from schemaASTs4", () => {
    const schemaASTs4 = [
      {
        name: "id",
        type: "ID",
        isPrimary: true,
        hasUniqueKey: false,
        hasForeignKey: true,
        foreign: {
          table: "trainer",
          field: "id",
        },
        hasLink: false,
        isArray: true,
      },
    ];

    const expectedString4 =
      'mutation {\n  delete_users(where: $where) @postgres {\n    status\n    error\n  }\n}';

    expect(generateGraphQDeleteQuery(schemaASTs4)).toEqual(expectedString4);
  });

  it("get graphqlString5 from schemaASTs5", () => {
    const schemaASTs5 = [
      {
        name: "id",
        type: "ID",
        isPrimary: false,
        hasUniqueKey: true,
        hasForeignKey: false,
        hasLink: true,
        link: {
          table: "publisher",
          from: "id",
          to: "name",
        },
        isArray: true,
      },
    ];

    const expectedString5 =
      'mutation {\n  delete_users(where: $where) @postgres {\n    status\n    error\n  }\n}';

    expect(generateGraphQDeleteQuery(schemaASTs5)).toEqual(expectedString5);
  });
});
