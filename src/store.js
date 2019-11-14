import { createStore } from "redux";
import { generateReducers } from "automate-redux";

// Initial state of redux
const initialState = {
  projects: [],
  pendingRequests: 0,
  uiState: {
    selectedCollection: ""
  },
  deployments: [
    {
      id: '123',
      name: 'Service 1',
      status: 'running',
      url: 'http:service1.galaxy.com',
      remarks: 'hello world'
    },
    {
      id: '456',
      name: 'Service 2',
      status: 'inactive(saving money)',
      url: 'http:service1.galaxy.com',
    },
    {
      id: '789',
      name: 'Service 3',
      status: 'failed (view remarks)',
      url: 'http:service1.galaxy.com',
    }
  ]
};

// Generate reducers with the initial state and pass it to the redux store
export default createStore(generateReducers(initialState), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());