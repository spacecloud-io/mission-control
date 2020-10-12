import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector } from "react-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import LetsEncryptEmail from "../../../components/settings/cluster/LetsEncryptEmail";
import Telemetry from "../../../components/settings/cluster/Telemetry";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import { Row, Col, Divider, Button, Badge } from "antd";
import { loadClusterSettings, saveClusterSetting } from "../../../operations/cluster";
import { projectModules, actionQueuedMessage } from "../../../constants";
import { CloseOutlined } from "@ant-design/icons";

const ClusterSettings = () => {
  const { projectID } = useParams();
  const history = useHistory();

  useEffect(() => {
    ReactGA.pageview("/projects/settings/cluster");
  }, []);

  useEffect(() => {
    incrementPendingRequests()
    loadClusterSettings()
      .catch(ex => notify("error", "Error fetching cluster settings", ex))
      .finally(() => decrementPendingRequests())
  }, []);

  const clusterConfig = useSelector(state => state.clusterConfig);
  const letsEncryptEmail = clusterConfig.letsencryptEmail;
  const telemetry = clusterConfig.enableTelemetry;
  const loading = useSelector(state => state.pendingRequests > 0)

  const handleLetsEncryptEmail = newEmail => {
    incrementPendingRequests()
    saveClusterSetting("letsencryptEmail", newEmail)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Changed letsencrypt email successfully"))
      .catch(ex => notify("error", "Error changing letsencrypt email", ex))
      .finally(() => decrementPendingRequests());
  };

  const handleTelemetry = newTelemetry => {
    incrementPendingRequests()
    saveClusterSetting("enableTelemetry", newTelemetry)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : `${newTelemetry ? "Enabled" : "Disabled"} telemetry successfully`))
      .catch(ex => notify("error", `Error ${newTelemetry ? "enabling" : "disabling"} telemetry`, ex))
      .finally(() => decrementPendingRequests());
  };

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.SETTINGS} />
      <ProjectPageLayout>
        <SettingsTabs activeKey="cluster" projectID={projectID} />
        <Content>
          <Row>
            <Col lg={{ span: 12 }}>
              <h2>Managed Rabbit MQ</h2>
              <p>A global Rabbit MQ cluster managed by Space Cloud available to be used as an event broker in all projects </p>
              {true ?
                <div className="config-card">
                  <p style={{ marginBottom: 24, fontSize: 16 }}>
                    <b style={{ marginRight: 8 }}>Status:</b> <Badge status="processing" text="Running" color={true ? "green" : "red"} text={true ? "Connected" : "Disconnected"} /> <br />
                    <b style={{ marginRight: 8 }}>CPU:</b> 2 <br />
                    <b style={{ marginRight: 8 }}>RAM:</b> 4 GB <br />
                    <b style={{ marginRight: 8 }}>High availability:</b> Off <CloseOutlined style={{ color: "red " }} /> <br />
                    <b style={{ marginRight: 8 }}>Storage class:</b> kuberntes.io/aws-ebs <br />
                    <b style={{ marginRight: 8 }}>Storage size:</b> 25 GB <br />
                  </p>
                  <Button style={{ marginRight: 16 }}>Edit config</Button>
                  <Button className="disable-btn">Disable Rabbit MQ</Button>
                </div> :
                <Button onClick={() => history.push(`/mission-control/projects/${projectID}/settings/cluster/rabbit-mq/config`)}>Enable Rabbit MQ</Button>
              }
              <Divider />
              <h2>Managed Redis</h2>
              <p>A global Redis instance managed by Space Cloud available to be used as a cache in all projects </p>
              {true ?
                <div className="config-card">
                  <p style={{ marginBottom: 24, fontSize: 16 }}>
                    <b style={{ marginRight: 8 }}>Status:</b> <Badge status="processing" text="Running" color={false ? "green" : "red"} text={false ? "Connected" : "Disconnected"} /> <br />
                    <b style={{ marginRight: 8 }}>CPU:</b> 2 <br />
                    <b style={{ marginRight: 8 }}>RAM:</b> 4 GB <br />
                  </p>
                  <Button style={{ marginRight: 16 }}>Edit config</Button>
                  <Button className="disable-btn">Disable Redis</Button>
                </div> :
                <Button onClick={() => history.push(`/mission-control/projects/${projectID}/settings/cluster/redis/config`)}>Enable Redis</Button>}
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
