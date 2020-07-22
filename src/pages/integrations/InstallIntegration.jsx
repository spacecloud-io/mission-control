import React, { useState } from 'react';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { Content, InnerTopBar } from '../../components/project-page-layout/ProjectPageLayout';
import { Row, Col, Steps, Card, Alert, Button, Result } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import PermissionsSection from '../../components/integrations/permissions/PermissionsSection';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getIntegrationDetails, getIntegrationConfigPermissions, getIntegrationAPIPermissions, installIntegration } from '../../operations/integrations';
import { formatIntegrationImageUrl, incrementPendingRequests, notify, decrementPendingRequests } from '../../utils';
const { Step } = Steps;

const InstallIntegration = () => {
  const history = useHistory()
  const { projectID, integrationId } = useParams()

  // Global state
  const { name, app } = useSelector(state => getIntegrationDetails(state, integrationId))
  const configPermissions = useSelector(state => getIntegrationConfigPermissions(state, integrationId))
  const apiPermissions = useSelector(state => getIntegrationAPIPermissions(state, integrationId))

  // Component state
  const [current, setCurrent] = useState(0);

  // Dervied state
  const integrationImgurl = formatIntegrationImageUrl(integrationId)

  // Handlers
  const handleStartIntegration = () => {
    incrementPendingRequests()
    installIntegration(integrationId)
      .then(() => {
        notify("success", "Success", "Installed integration successfully")
        setCurrent(current + 1)
      })
      .catch(ex => notify("error", "Error installing integration", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleOpenConsole = () => {
    window.open(app, "_blank")
  }

  const handleBackToIntegrations = () => {
    history.push(`/mision-control/projects/${projectID}/integrations`)
  }

  const steps = [
    {
      title: 'Grant permissions',
      content:
        <Row>
          <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }} >
            <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
              <PermissionsSection name={name} imgUrl={integrationImgurl} apiPermissions={apiPermissions} configPermissions={configPermissions} scrollHeight={240} />
              <Button type='primary' block size="large" style={{ marginTop: 32 }} onClick={() => setCurrent(current + 1)}>Grant permissions</Button>
            </Card>
          </Col>
        </Row>
    },
    {
      title: 'Start integration',
      content:
        <Row>
          <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }}>
            <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
              <center>
                <PlayCircleOutlined style={{ fontSize: '40px', color: "rgba(0,0,0,0.56)" }} />
                <p style={{ marginTop: '16px' }}>Once you click the start button, space cloud will run the integration and create all the dependencies that it require. </p>
              </center>
              <Alert type='info' showIcon
                message='The integration will have its own UI to configure and use it. The UI will be available once you start the integration.'
                description=' ' />
              <Button type='primary' style={{ marginTop: 32 }} block size="large" onClick={handleStartIntegration}>Start integration</Button>
            </Card>
          </Col>
        </Row>
    }, {
      title: 'Open console',
      content:
        <Row>
          <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }}>
            <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
              <Result
                status='success'
                title="Success"
                subTitle="Integration installed sucessfully"
                extra={[
                  <Button key="console" type='primary' size="large" onClick={handleOpenConsole}>Open console</Button>,
                  <Button key="back" size="large" onClick={handleBackToIntegrations}>Back to integrations page</Button>
                ]} />
            </Card>
          </Col>
        </Row>
    }];

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='integrations' />
      <ProjectPageLayout>
        <InnerTopBar title='Install integration' />
        <Content>
          <Row>
            <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }} >
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