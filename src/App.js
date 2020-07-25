import React from 'react';
import { useSelector } from "react-redux";
import { Spin } from "antd"
import Routes from './Routes';

function App() {
  const pendingRequests = useSelector(state => state.pendingRequests)
  const loading = pendingRequests > 0 ? true : false
  return (
    <div>
      <Routes />
      {loading && <Spin spinning={true} size="large" />}
    </div>
  );
}

export default App;
