import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector, useDispatch } from "react-redux";
import { get, set, increment, decrement } from "automate-redux";
import SettingsTabs from "../../components/settings/settings-tabs/SettingsTabs";
import Credentials from "../../components/settings/cluster/Credentials";
import LetsEncryptEmail from "../../components/settings/cluster/LetsEncryptEmail";
import Telemetry from "../../components/settings/cluster/Telemetry";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import "./settings.css";
import { getProjectConfig, notify, setProjectConfig, openProject } from "../../utils";
import client from "../../client";
import { Row, Col } from "antd";
import store from "../../store";
import history from "../../history";

const ClusterSettings = () => {
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/settings/cluster-settings");
  }, []);

  const dispatch = useDispatch();

  const { credentials, ...globalConfig } = useSelector(state => state.clusters);
  
  const letsEncryptEmail = globalConfig.email;
  const telemetry = globalConfig.telemetry;
  const loading = useSelector(state => state.pendingRequests > 0)
  
  const handleLetsEncryptEmail = newEmail => {
    dispatch(increment("pendingRequests"));
    client.clusters
      .setClustersConfig(Object.assign({}, globalConfig, { email: newEmail }))
      .then(() => {
        store.dispatch(set("clusters.email", newEmail));
        notify("success", "Success", "Changed letsEncrypt email successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleTelemetry = newTelemetry => {
    dispatch(increment("pendingRequests"));
    client.clusters
      .setClustersConfig(Object.assign({}, globalConfig, { telemetry: newTelemetry }))
      .then(() => {
        store.dispatch(set("clusters.telemetry", newTelemetry));
        notify("success", "Success", "Changed telemetry successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='project-settings' />
      <div className='page-content page-content--no-padding'>
        <SettingsTabs activeKey="cluster" projectID={projectID} />
        <div className="setting-content">
        <Row>
          <Col lg={{ span: 12 }}>
            <Credentials credentials={credentials} />
            <div className="divider" />
            <LetsEncryptEmail letsEncryptEmail={letsEncryptEmail} loading={loading} handleSubmit={handleLetsEncryptEmail}/>
            <div className="divider" />
            <Telemetry telemetry={telemetry} handleSubmit={handleTelemetry}/>
          </Col>
        </Row>
      </div>
      </div>
    </React.Fragment>
  );
};

export default ClusterSettings;
