import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector } from "react-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import Credentials from "../../../components/settings/cluster/Credentials";
import LetsEncryptEmail from "../../../components/settings/cluster/LetsEncryptEmail";
import Telemetry from "../../../components/settings/cluster/Telemetry";
import License from "../../../components/settings/cluster/License";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { notify, incrementPendingRequests, decrementPendingRequests, openBillingPortal } from "../../../utils";
import { Row, Col, Divider } from "antd";
import { loadClusterSettings, saveClusterSetting, removeClusterLicense, getEnv } from "../../../operations/cluster";

const ClusterSettings = () => {
  const history = useHistory();
  const { projectID } = useParams();

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
  const credentials = clusterConfig.credentials;
  const letsEncryptEmail = clusterConfig.email;
  const telemetry = clusterConfig.telemetry;
  const loading = useSelector(state => state.pendingRequests > 0)
  const { clusterName, licenseType, licenseKey, nextRenewal } = useSelector(state => getEnv(state))

  const handleLetsEncryptEmail = newEmail => {
    incrementPendingRequests()
    saveClusterSetting("email", newEmail)
      .then(() => notify("success", "Success", "Changed letsencrypt email successfully"))
      .catch(ex => notify("error", "Error changing letsencrypt email", ex))
      .finally(() => decrementPendingRequests());
  };

  const handleTelemetry = newTelemetry => {
    incrementPendingRequests()
    saveClusterSetting("telemetry", newTelemetry)
      .then(() => notify("success", "Success", `${newTelemetry ? "Enabled" : "Disabled"} telemetry successfully`))
      .catch(ex => notify("error", `Error ${newTelemetry ? "enabling" : "disabling"} telemetry`, ex))
      .finally(() => decrementPendingRequests());
  };

  const handleOpenApplyLicensePage = () => history.push(`/mission-control/projects/${projectID}/settings/apply-license`)
  const handleRemoveLicense = () => {
    incrementPendingRequests()
    removeClusterLicense()
      .then(() => notify("success", "Success", "Removed license successfully"))
      .catch((ex) => notify("error", "Error removing license", ex))
      .finally(() => decrementPendingRequests())
  }

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
              <License handleApplyLicense={handleOpenApplyLicensePage} handleGetLicense={openBillingPortal} handleRemoveLicense={handleRemoveLicense} clusterName={clusterName} licenseKey={licenseKey} licenseType={licenseType} nextRenewal={nextRenewal} />
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
