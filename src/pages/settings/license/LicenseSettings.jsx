import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import License from "../../../components/settings/license/LicenseDetails";
import ClusterQuotas from "../../../components/settings/license/ClusterQuotas";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { notify, incrementPendingRequests, decrementPendingRequests, openBillingPortal } from "../../../utils";
import { Row, Col, Divider } from "antd";
import { loadClusterSettings, removeClusterLicense, getEnv, isClusterUpgraded } from "../../../operations/cluster";
import { projectModules } from "../../../constants";
import ClusterEnvironment from "../../../components/settings/license/ClusterEnvironment";

const LicenseSettings = () => {
  const history = useHistory();
  const { projectID } = useParams();

  useEffect(() => {
    incrementPendingRequests()
    loadClusterSettings()
      .catch(ex => notify("error", "Error fetching cluster settings", ex))
      .finally(() => decrementPendingRequests())
  }, []);

  const { clusterName, plan, licenseKey, licenseMode, sessionId, nextRenewal, quotas } = useSelector(state => getEnv(state))
  const clusterUpgraded = useSelector(state => isClusterUpgraded(state))

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
      <Sidenav selectedItem={projectModules.SETTINGS} />
      <ProjectPageLayout>
        <SettingsTabs activeKey="license" projectID={projectID} />
        <Content>
          <Row>
            <Col lg={{ span: 12 }}>
              <License clusterUpgraded={clusterUpgraded} handleApplyLicense={handleOpenApplyLicensePage} handleGetLicense={openBillingPortal} handleRemoveLicense={handleRemoveLicense} clusterName={clusterName} licenseKey={licenseKey} plan={plan} nextRenewal={nextRenewal} licenseMode={licenseMode} />
              <Divider />
              <ClusterEnvironment licenseMode={licenseMode} sessionId={sessionId} />
              <Divider />
              <ClusterQuotas clusterUpgraded={clusterUpgraded} handleGetLicense={openBillingPortal} quotas={quotas} />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default LicenseSettings;
