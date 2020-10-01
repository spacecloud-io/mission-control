export const defaultTemplate = `// DB object
const dbAlias = "mongo"; // Your DB Alias
const db = api.DB(dbAlias);
  
// Your logic
`;

export const insertTemplate = `// DB object
const dbAlias = "mongo"; // Your DB Alias
const db = api.DB(dbAlias);

// Document to be inserted
const doc = { text: "Star Space Cloud!", time: new Date() };

// Send request to Space Cloud
db.insert("todos").doc(doc).apply();
`;

export const getTemplate = `// DB object
const dbAlias = "mongo"; // Your DB Alias
const db = api.DB(dbAlias);

// Send request to Space Cloud
db.get("todos").apply();
`;

export const callTemplate = `// Service name
const serviceName = "my-service";

// Function to be triggered
const funcName = "my-func";

// Params to be sent to the function
const params = { msg: "Function Mesh is awesome!" };
// Send request to Space Cloud to trigger backend function
api.call(serviceName, funcName, params);
`;
