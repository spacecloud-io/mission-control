import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector, useDispatch } from "react-redux";
import { set, increment, decrement } from "automate-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import Credentials from "../../../components/settings/cluster/Credentials";
import LetsEncryptEmail from "../../../components/settings/cluster/LetsEncryptEmail";
import Telemetry from "../../../components/settings/cluster/Telemetry";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { notify } from "../../../utils";
import client from "../../../client";
import { Row, Col, Divider } from "antd";
import store from "../../../store";

const ClusterSettings = () => {
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/settings/cluster");
  }, []);

  const dispatch = useDispatch();

  const { credentials, ...globalConfig } = useSelector(state => state.clusterConfig);

  const letsEncryptEmail = globalConfig.email;
  const telemetry = globalConfig.telemetry;
  const loading = useSelector(state => state.pendingRequests > 0)

  const handleLetsEncryptEmail = newEmail => {
    dispatch(increment("pendingRequests"));
    client.clusterConfig
      .setConfig(Object.assign({}, globalConfig, { email: newEmail }))
      .then(() => {
        store.dispatch(set("clusterConfig.email", newEmail));
        notify("success", "Success", "Changed LetsEncrypt email successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleTelemetry = newTelemetry => {
    dispatch(increment("pendingRequests"));
    client.clusterConfig
      .setConfig(Object.assign({}, globalConfig, { telemetry: newTelemetry }))
      .then(() => {
        store.dispatch(set("clusterConfig.telemetry", newTelemetry));
        notify("success", "Success", `${newTelemetry ? "Enabled": "Disabled"} telemetry successfully`);
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='settings' />
      <ProjectPageLayout>
        <SettingsTabs activeKey="cluster" projectID={projectID} />
        <Content>
          <Row>
            <Col lg={{ span: 12 }}>
              <Credentials credentials={credentials} />
              <Divider />
              <LetsEncryptEmail letsEncryptEmail={letsEncryptEmail} loading={loading} handleSubmit={handleLetsEncryptEmail} />
              <Divider />
              <Telemetry telemetry={telemetry} loading={loading} handleSubmit={handleTelemetry} />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default ClusterSettings;
