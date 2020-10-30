import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import LetsEncryptEmail from "../../../components/settings/cluster/LetsEncryptEmail";
import Telemetry from "../../../components/settings/cluster/Telemetry";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import { Row, Col, Divider, Badge } from "antd";
import { loadClusterSettings, saveClusterSetting } from "../../../operations/cluster";
import { projectModules, actionQueuedMessage } from "../../../constants";

const ClusterSettings = () => {
  const { projectID } = useParams();

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
