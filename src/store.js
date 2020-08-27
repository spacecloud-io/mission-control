import { createStore, applyMiddleware, compose } from "redux";
import { generateReducers } from "automate-redux";
import thunk from "redux-thunk";

// Initial state of redux
const initialState = {
	projects: [],
	clusters: [],
	dbSchemas: {},
	dbRules: {},
	dbConfigs: {},
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
		quotas: { maxDatabases: 1, maxProjects: 1, integrationLevel: 0 }
	}
};

// Generate reducers with the initial state and pass it to the redux store
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default createStore(generateReducers(initialState), composeEnhancers(applyMiddleware(thunk)));

export const createReduxStore = (initialState) => createStore(generateReducers(initialState), applyMiddleware(thunk));