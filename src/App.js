import React from 'react';
import { useSelector } from "react-redux";
import { Spin } from "antd"
import Routes from './routes/Routes';
import { isSetupComplete } from './utils';
import Home from "./pages/home/Home";

function App() {
  const pendingRequests = useSelector(state => state.pendingRequests)
  const loading = pendingRequests > 0 ? true : false
  const setupComplete = useSelector(state => isSetupComplete(state))

  if (!setupComplete) {
    return <Home />
  }

  return (
    <React.Fragment>
      <Routes />
      {loading && <Spin className='page-loading' spinning={true} size="large" />}
    </React.Fragment>
  );
}

export default App;
