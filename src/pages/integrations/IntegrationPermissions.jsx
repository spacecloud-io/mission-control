import React from 'react';
import { Row, Col } from 'antd';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { InnerTopBar, Content } from '../../components/project-page-layout/ProjectPageLayout';
import PermissionsSection from '../../components/integrations/permissions/PermissionsSection';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getIntegrationDetails, getIntegrationConfigPermissions, getIntegrationAPIPermissions } from '../../operations/integrations';
import { formatIntegrationImageUrl } from '../../utils';
import { projectModules } from '../../constants';

const IntegrationPermissions = () => {
  const { integrationId } = useParams()

  // Global state
  const { name } = useSelector(state => getIntegrationDetails(state, integrationId))
  const configPermissions = useSelector(state => getIntegrationConfigPermissions(state, integrationId))
  const apiPermissions = useSelector(state => getIntegrationAPIPermissions(state, integrationId))

  // Dervied state
  const integrationImgurl = formatIntegrationImageUrl(integrationId)

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.INTEGRATIONS} />
      <ProjectPageLayout>
        <InnerTopBar title='Integration details' />
        <Content>
          <Row>
            <Col lg={{ span: 16, offset: 4 }}>
              <PermissionsSection name={name} imgUrl={integrationImgurl} apiPermissions={apiPermissions} configPermissions={configPermissions} />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default IntegrationPermissions;