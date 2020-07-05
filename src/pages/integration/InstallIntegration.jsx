import React, { useState } from 'react';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { Content, InnerTopBar } from '../../components/project-page-layout/ProjectPageLayout';
import { Row, Col, Steps, Card, Alert, Button, Result } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import ElasticSearchPermissions from '../../components/integration/permissions/ElasticSearchPermission';

const InstallIntegration = () => {

  const { Step } = Steps;
  const [current, setCurrent] = useState(0);

  const steps = [{
    title: 'Grant permissions',
    content: 
      <Row>
        <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }} >
          <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
            <ElasticSearchPermissions scroll={{ y: 240}} />
            <Button type='primary' style={{ width:'100%', marginTop:'32px' }} onClick={() => setCurrent(current + 1)}>Grant permissions</Button>
          </Card>
        </Col>
      </Row>
  },
  {
    title: 'Start integration',
    content: 
      <Row>
        <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }}>
          <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
            <center>
              <PlayCircleOutlined style={{ fontSize:'40px' }} />
              <p style={{ marginTop:'16px' }}>Once you click the start button, space cloud will run the integration and create all the dependencies that it require. </p>
            </center>
            <Alert type='info' showIcon 
              message='The integration will have its own UI to configure and use it. The UI will be available once you start the integration.'
              description=' ' />
            <Button type='primary' style={{ width:'100%', marginTop:'32px' }} onClick={() => setCurrent(current + 1)}>Start integration</Button>
          </Card>
        </Col>
      </Row>
  },{
    title: 'Open console',
    content: 
      <Row>
        <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }}>
          <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
            <Result
              status='success'
              title='Integration installed sucessfully'
              extra={[
                <Button type='primary'>Open console</Button>
              ]} />
          </Card>
        </Col>
      </Row>
  }];

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='integration' />
      <ProjectPageLayout>
        <InnerTopBar title='Install integration' />
        <Content>
          <Row>
          <Col lg={{ span: 10, offset: 7 }} sm={{ span: 24 }} >
            <Steps current={current} className="step-display" size="small">
              {steps.map(item => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps><br />
          </Col>
        </Row>
        {steps[current].content}
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default InstallIntegration;