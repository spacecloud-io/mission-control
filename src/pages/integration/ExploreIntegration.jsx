import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { Content } from '../../components/project-page-layout/ProjectPageLayout';
import IntegrationTabs from '../../components/integration/integration-tabs/IntegrationTabs';
import emptyStateSvg from '../../assets/celebrate.svg';
import { Button, Row, Col } from 'antd';
import ElasticSearch from '../../components/integration/integration-cards/ElasticSearch';
import TeamManagement from '../../components/integration/integration-cards/TeamManagement';

const ExploreIntegration = () => {

  const { projectID } = useParams();
  const history = useHistory();

  const emptyState = 
    <React.Fragment>
      <Row>
        <Col lg={{ span:10, offset:7 }} style={{ textAlign: 'center', marginTop:'72px' }}>
          <img src={emptyStateSvg} />
          <p style={{ marginTop: '24px' }}>You have installled all integrations. Time to sit back and celebrate</p>
          <Button type='primary' onClick={() => history.push(`/mission-control/projects/${projectID}/integration/installed`)}>View installed integrations</Button>
        </Col>
      </Row>
    </React.Fragment>

  return(
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='integration' />
      <ProjectPageLayout>
        <IntegrationTabs activeKey='explore' projectID={projectID} />
        <Content>
          {emptyState}
          <Row gutter={[24, 24]}>
            <Col lg={{ span:7 }}>
              <ElasticSearch installed={false} />
            </Col>
            <Col lg={{ span:7 }}>
              <TeamManagement installed={false} />
            </Col>
            <Col lg={{ span:7 }}>
              <ElasticSearch installed={true} />
            </Col>
            <Col lg={{ span:7 }}>
              <TeamManagement installed={true} />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default ExploreIntegration;