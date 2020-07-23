import { createStore } from "redux";
import { generateReducers } from "automate-redux";

// Initial state of redux
const initialState = {
	projects: [],
	clusters: [],
	dbSchemas: {},
	dbRules: {},
	dbConfig: {},
	dbPreparedQueries: {},
	dbCollections: {},
	dbConnState: {},
	fileStoreConfig: {},
	fileStoreRules: [],
	eventingConfig: {},
	eventingTriggers: {},
	eventingSchemas: {},
	eventingRules: {},
	secrets: [],
	clusterConfig: {},
	serviceRoutes: {},
	pendingRequests: 0,
	uiState: {
		selectedCollection: "",
		showSigninModal: false,
		showSidenav: false,
		sideNavActiveKeys: ["1", "2"],
		eventFilters: {
			status: ["processed", "staged", "failed"],
			showName: false,
			showDate: false
		},
		explorer: {
			filters: [],
			sorters: []
		},
		graphiql: {
			query: '',
			variables: ''
		}
	},
	eventLogs: [],
	env: {
		version: "",
		clusterId: null,
		plan: "space-cloud-open--monthly",
		quotas: { maxDatabases: 1, maxProjects: 1 }
	}
};

// Generate reducers with the initial state and pass it to the redux store
export default createStore(generateReducers(initialState), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());