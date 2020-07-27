import React from 'react';
import { useParams } from 'react-router-dom';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { Content } from '../../components/project-page-layout/ProjectPageLayout';
import IntegrationTabs from '../../components/integrations/integration-tabs/IntegrationTabs';
import IntegrationsList from "../../components/integrations/integrations-list/IntegrationsList";
import { Row, Col } from "antd";
import { useSelector } from 'react-redux';
import { getIntegrations } from '../../operations/integrations';
import { projectModules } from '../../constants';

const ExploreIntegrations = () => {

  const { projectID } = useParams();

  // Global state
  const integrations = useSelector(state => getIntegrations(state))

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.INTEGRATIONS} />
      <ProjectPageLayout>
        <IntegrationTabs activeKey='explore' projectID={projectID} />
        <Content>
          <Row>
            <Col lg={{ span: 20 }} sm={{ span: 14 }}>
              <IntegrationsList integrations={integrations} />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default ExploreIntegrations;