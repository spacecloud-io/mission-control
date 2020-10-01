import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { Content } from '../../components/project-page-layout/ProjectPageLayout';
import IntegrationTabs from '../../components/integrations/integration-tabs/IntegrationTabs';
import emptyStateSvg from '../../assets/routing.svg';
import IntegrationsList from "../../components/integrations/integrations-list/IntegrationsList";
import { Row, Col, Button, Input } from "antd";
import { useSelector } from 'react-redux';
import { getInstalledIntegrations } from '../../operations/integrations';
import { projectModules } from '../../constants';

const InstalledIntegrations = () => {

  const { projectID } = useParams();
  const history = useHistory();
  const [searchText, setSearchText] = useState('');

  const installedIntegrations = useSelector(state => getInstalledIntegrations(state)).map(obj => Object.assign({}, obj, { installed: true }))

  const emptyState =
    <React.Fragment>
      <Row>
        <Col lg={{ span: 10, offset: 7 }} style={{ textAlign: 'center', marginTop: '72px' }}>
          <img src={emptyStateSvg} />
          <p style={{ marginTop: '24px' }}>No integrations installed yet</p>
          <Button type='primary' onClick={() => history.push(`/mission-control/projects/${projectID}/integrations/explore`)}>Explore integrations</Button>
        </Col>
      </Row>
    </React.Fragment>

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.INTEGRATIONS} />
      <ProjectPageLayout>
        <IntegrationTabs activeKey='installed' projectID={projectID} />
        <Content>
          <Input.Search placeholder='Search by installed integration name' style={{ width:'320px', marginBottom: '16px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
          {installedIntegrations.length === 0 && emptyState}
          {installedIntegrations.length > 0 && (
            <Row>
              <Col lg={{ span: 20 }} sm={{ span: 14 }}>
                <IntegrationsList integrations={installedIntegrations} searchText={searchText} />
              </Col>
            </Row>
          )}
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default InstalledIntegrations;