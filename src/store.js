import { createStore } from "redux";
import { generateReducers } from "automate-redux";

// Initial state of redux
const initialState = {
    projects: [],
    serviceRoutes: {},
    pendingRequests: 0,
    uiState: {
        selectedCollection: "",
        showSidenav: false,
        sideNavActiveKeys: ["1", "2"]
    },
    clusters: []
};

// Generate reducers with the initial state and pass it to the redux store
export default createStore(generateReducers(initialState), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());