import React from 'react';
import { useSelector } from "react-redux";
import { Spin } from "antd"
import Routes from './Routes';
import discord from './assets/discord.svg'

function App() {
  const pendingRequests = useSelector(state => state.pendingRequests)
  const loading = pendingRequests > 0 ? true : false
  return (
    <div>
      <Routes />
      {loading && <Spin spinning={true} size="large" />}
      <a href="https://discordapp.com/invite/ypXEEBr" target="_blank" className="discord valign-wrapper">
        <span>Have a Question?</span>
        <img src={discord} alt="" />
      </a>
    </div>
  );
}

export default App;
