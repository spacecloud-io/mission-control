import React from 'react';
import { Row, Col } from 'antd';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { InnerTopBar, Content } from '../../components/project-page-layout/ProjectPageLayout';
import ElasticSearchPermission from '../../components/integration/permissions/ElasticSearchPermission';
import ElasticSearchPermissions from '../../components/integration/permissions/ElasticSearchPermission';

const IntegrationPermissions = () => {
  return(
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='integration' />
      <ProjectPageLayout>
        <InnerTopBar title='Integration details' />
        <Content>
          <Row>
            <Col lg={{ span:14, offset:5 }}>
              <ElasticSearchPermissions />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default IntegrationPermissions;