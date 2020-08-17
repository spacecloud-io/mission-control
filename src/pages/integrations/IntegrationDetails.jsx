import React from 'react';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { Content, InnerTopBar } from '../../components/project-page-layout/ProjectPageLayout';
import IntegrationDetailsCard from '../../components/integrations/integration-details-card/IntegrationDetailsCard';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { getIntegrationDetails } from '../../operations/integrations';
import { useHistory, useParams } from 'react-router-dom';
import { formatIntegrationImageUrl } from '../../utils';
import { projectModules } from '../../constants';

const IntegrationDetails = () => {
  const history = useHistory()
  const { projectID, integrationId } = useParams()

  // Global state
  const { id, name, details, installed } = useSelector(state => getIntegrationDetails(state, integrationId))

  // Derived state
  const integrationImgUrl = formatIntegrationImageUrl(id)

  // Handlers
  const handleInstallClick = () => {
    history.push(`/mission-control/projects/${projectID}/integrations/install/${integrationId}`)
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.INTEGRATIONS} />
      <ProjectPageLayout>
        <InnerTopBar title='Integration details' />
        <Content>
          <Row>
            <Col lg={{ span: 14, offset: 5 }}>
              <IntegrationDetailsCard name={name} imgUrl={integrationImgUrl} details={details} installed={installed} handleInstallClick={handleInstallClick} />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default IntegrationDetails;