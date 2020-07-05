import React from 'react';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { Content, InnerTopBar } from '../../components/project-page-layout/ProjectPageLayout';
import ElasticSearchDetails from '../../components/integration/card-details/ElasticSearchDetails';
import { Row, Col } from 'antd';

const IntegrationDetails = () => {

  return(
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='integration' />
      <ProjectPageLayout>
        <InnerTopBar title='Integration details' />
        <Content>
          <Row>
            <Col lg={{ span:14, offset:5 }}>
              <ElasticSearchDetails installed={false} />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default IntegrationDetails;