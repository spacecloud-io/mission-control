import { generateSchemaASTs } from "./graphql";

// Generate SchemASTs test
describe("generateSchemaASTs method", () => {
  it("get schemaASTs1 from schemaString1", () => {
    const schemaString1 =
      "type users {\n  id: ID! @primary\n  email: ID!\n  name: String!\n  pass: String!\n  role: String!\n}";

    const expectedSchemaASTs1 = [
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

    expect(generateSchemaASTs(schemaString1)).toEqual(expectedSchemaASTs1);
  });

  it("get schemaASTs2 from schemaString2", () => {
    const schemaString2 =
      "type post {\n   id: ID! @primary\n  title: String!\n  text: String!\n category: String\n  is_published: Boolean!\n  published_date: DateTime\n}";

    const expectedSchemaASTs2 = [
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
    expect(generateSchemaASTs(schemaString2)).toEqual(expectedSchemaASTs2);
  });

  it("get schemaASTs3 from schemaString3", () => {
    const schemaString3 =
      'type trainer {\n  id: ID! @primary\n  name: String!\n  pokemons: [pokemon] @link(table: "pokemon", from: "id", to: "trainer_id")\n}';

    const expectedSchemaASTs3 = [
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
    expect(generateSchemaASTs(schemaString3)).toEqual(expectedSchemaASTs3);
  });

  it("get schemaASTs4 from schemaString4", () => {
    const schemaString4 =
      'type pokemon {\n  id: ID! @primary\n  name: String!\n  trainer_id: ID! @foreign(table: "trainer", field: "id")\n}';

    const expectedSchemaASTs4 = [
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
    expect(generateSchemaASTs(schemaString4)).toEqual(expectedSchemaASTs4);
  });

  it("get schemaASTs5 from schemaString5", () => {
    const schemaString5 =
      'type users {\n  id: ID!\n  name: String! @unique\n  text: String!\n  number: Int\n  is_published: Boolean!\t\n  trainer_id: ID! @link(table: "publisher", from: "id", to: "name")\n}\n';

    const expectedSchemaASTs5 = [
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
    expect(generateSchemaASTs(schemaString5)).toEqual(expectedSchemaASTs5);
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
      'mutation {\n  delete_users(where: {id: "69a538"}) @postgres {\n    status\n    error\n  }\n}';

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
      'mutation {\n  delete_users(where: {id: "21f525"}) @postgres {\n    status\n    error\n  }\n}';

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
      "mutation {\n delete_users(where: {id: \"416abf\"}) @postgres {\n status\n  error\n }\n}";

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
    "mutation {\n  delete_users(where: {id: \"c8b12d\"}) @postgres {\n    status\n    error\n  }\n}"

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
    "mutation {\n  delete_users(where: {id: \"83be26\"}) @postgres {\n    status\n    error\n  }\n}"

    expect(generateGraphQDeleteQuery(schemaASTs5)).toEqual(expectedString5);
  });
});
