import { createStore } from "redux";
import { generateReducers } from "automate-redux";

// Initial state of redux
const initialState = {
    projects: [],
    pendingRequests: 0,
    uiState: {
        selectedCollection: "",
        showSidenav: false,
        sideNavActiveKeys: ["1", "2"]
    },
    clusters: [
        {
            id: "us-east-1",
            type: "Docker",
            url: "abc.xyz.com",
            project: ["project1", "project2", "todo_app", "project3"],
        },
        {
            id: "us-east-2",
            type: "Kubernetes",
            url: "pab.xyz.com",
            project: ["project1", "project2", "todo_app", "project3"],
        },
        {
            id: "us-east-3",
            type: "Kubernetes",
            url: "pab34.xyz.com",
            project: ["project1", "project2", "todo_app", "project3"],
        },
        {
            id: "us-east-4",
            type: "Docker",
            url: "pab34.xyz.com",
            project: ["todo_app", "project2"],
        },
        {
            id: "us-east-5",
            type: "Docker",
            url: "pab34.xyz.com",
            project: ["todo_app45", "project2", "project89", "project3"],
        },
        {
            id: "us-east-6",
            type: "Docker",
            url: "p.xyz.com",
            project: ["todo_app45", "project2", "project3"],
        }
    ]
};

// Generate reducers with the initial state and pass it to the redux store
export default createStore(generateReducers(initialState), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());