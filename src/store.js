import { createStore } from "redux";
import { generateReducers } from "automate-redux";

// Initial state of redux
const initialState = {
	projects: [],
  clusters: [],
  clusterConfig: {},
  serviceRoutes: {},
  deploymentStatus: {},
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
    }
	},
	eventLogs: [],
	credentials: {},
	env: {
		version: "",
		clusterId: null,
		plan: "space-cloud-open--monthly",
		quotas: { maxDatabases: 1, maxProjects: 1 }
	},
	billing: {
		status: false,
		balanceCredits: 0,
		details: {}
	},
	invoices: []
};

// Generate reducers with the initial state and pass it to the redux store
export default createStore(generateReducers(initialState), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());