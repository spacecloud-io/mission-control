import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../../utils';
import { Row, Col } from "antd";
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout";
import Topbar from '../../../components/topbar/Topbar';
import Sidenav from '../../../components/sidenav/Sidenav';
import ApplyLicenseForm from "../../../components/settings/apply-license/ApplyLicenseForm";
import { getEnv, applyClusterLicense, applyOfflineClusterLicense } from '../../../operations/cluster';
import { projectModules } from '../../../constants';

const ApplyLicense = () => {
  const history = useHistory()

  // Global state
  const { clusterName, licenseMode } = useSelector(state => getEnv(state))

  const handleApplyLicense = (clusterName, licenseKey, licenseValue) => {
    incrementPendingRequests()
    applyClusterLicense(clusterName, licenseKey, licenseValue)
      .then(() => {
        notify("success", "Success", "Applied license key to cluster successfully")
        history.goBack()
      })
      .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to set cluster" : error.msg))
      .finally(() => decrementPendingRequests())
  }

  const handleApplyOfflineLicense = (licenseKey) => {
    incrementPendingRequests()
    applyOfflineClusterLicense(licenseKey).then(() => {
      notify("success", "Success", "Applied license key to cluster successfully")
      history.goBack()
    })
    .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to set cluster" : error.msg))
    .finally(() => decrementPendingRequests())
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.SETTINGS} />
      <ProjectPageLayout>
        <InnerTopBar title="Apply license key" />
        <Content>
          <Row>
            <Col lg={{ span: 12, offset: 6 }}>
              <ApplyLicenseForm 
                clusterName={clusterName} 
                handleSubmit={handleApplyLicense} 
                handleSubmitOfflineLicense={handleApplyOfflineLicense}
                licenseMode={licenseMode}/>
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default ApplyLicense;