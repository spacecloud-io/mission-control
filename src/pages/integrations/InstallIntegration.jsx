import React, { useState } from 'react';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import ProjectPageLayout, { Content, InnerTopBar } from '../../components/project-page-layout/ProjectPageLayout';
import { Row, Col, Steps, Card, Alert, Button, Result, Spin } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import PermissionsSection from '../../components/integrations/permissions/PermissionsSection';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getIntegrationDetails, getIntegrationConfigPermissions, getIntegrationAPIPermissions, installIntegration } from '../../operations/integrations';
import { formatIntegrationImageUrl, notify } from '../../utils';
import { projectModules, actionQueuedMessage } from '../../constants';
import client from "../../client";
const { Step } = Steps;

let healthCheckInterval = null

const InstallIntegration = () => {
  const history = useHistory()
  const { projectID, integrationId } = useParams()
  const { state } = useLocation()
  const useUploadedIntegration = state && state.useUploadedIntegration ? true : false

  // Global state
  const { name, appUrl, healthCheckUrl } = useSelector(state => getIntegrationDetails(state, integrationId, useUploadedIntegration))
  const configPermissions = useSelector(state => getIntegrationConfigPermissions(state, integrationId, useUploadedIntegration))
  const apiPermissions = useSelector(state => getIntegrationAPIPermissions(state, integrationId, useUploadedIntegration))

  // Component state
  const [current, setCurrent] = useState(0);
  const [installationCompleted, setInstallationCompleted] = useState(false)
  const [installationSucceeded, setInstallationSucceeded] = useState(false)
  const [installationQueued, setInstallationQueued] = useState(false)
  const [healthCheckCompleted, setHealthCheckCompleted] = useState(false)
  const [healthCheckPassed, setHealthCheckPassed] = useState(false)

  // Dervied state
  const integrationImgurl = formatIntegrationImageUrl(integrationId)

  // Handlers
  const resetAllStatuses = () => {
    setInstallationCompleted(false)
    setInstallationQueued(false)
    setInstallationSucceeded(false)
    setHealthCheckCompleted(false)
    setHealthCheckPassed(false)
  }

  const handleStartIntegration = () => {
    resetAllStatuses()
    installIntegration(integrationId, useUploadedIntegration)
      .then(({ queued }) => {
        setInstallationCompleted(true)
        if (queued) {
          notify("success", "Success", actionQueuedMessage)
          setInstallationQueued(true)
          setInstallationSucceeded(false)
        } else {
          setInstallationSucceeded(true)
          // If health check url is not provided, then simulate health check passed in 5 seconds
          if (!healthCheckUrl) {
            setTimeout(() => {
              setHealthCheckCompleted(true)
              setHealthCheckPassed(true)
            }, 5000)
            return
          }
          healthCheckInterval = setInterval(() => {
            client.integrations.fetchIntegrationStatus(healthCheckUrl)
              .then(({ ack, retry, error }) => {
                if (retry) {
                  return
                }
                setHealthCheckCompleted(true)
                setHealthCheckPassed(ack)
                clearInterval(healthCheckInterval)
                if (!ack) {
                  notify("error", "Error getting integration console ready", error)
                  return
                }
                notify("success", "Success", "Integration installed successfully")
              })
              .catch(ex => {
                setHealthCheckCompleted(true)
                setHealthCheckPassed(false)
                clearInterval(healthCheckInterval)
                notify("error", "Error getting integration console ready", ex)
              })
          }, 2000)
        }
      })
      .catch(ex => {
        setInstallationCompleted(true)
        setInstallationSucceeded(false)
        notify("error", "Error installing integration", ex)
      })
  }

  const handleOpenConsole = () => {
    window.open(appUrl, "_blank")
  }

  const handleBackToIntegrations = () => {
    history.push(`/mission-control/projects/${projectID}/integrations`)
  }

  const BackToIntegrationsPageButton = () => {
    return (
      <Button key="back" size="large" onClick={handleBackToIntegrations}>Back to integrations page</Button>
    )
  }

  const RetryInstallationButton = () => {
    return (
      <Button key="error" type='danger' size="large" onClick={handleStartIntegration}>Retry</Button>
    )
  }

  const OpenConsoleButton = () => {
    return (
      <Button key="console" type='primary' size="large" onClick={handleOpenConsole}>Open console</Button>
    )
  }

  const steps = [
    {
      title: 'Grant permissions',
      content:
        <Row>
          <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }} >
            <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
              <PermissionsSection
                name={name}
                imgUrl={integrationImgurl}
                apiPermissions={apiPermissions}
                configPermissions={configPermissions}
                scrollHeight={240} />
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
              <Button type='primary' style={{ marginTop: 32 }} block size="large" onClick={() => { setCurrent(current + 1); handleStartIntegration() }}>Start integration</Button>
            </Card>
          </Col>
        </Row>
    }, {
      title: 'Open console',
      content:
        <Row>
          <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }}>
            <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px', textAlign: 'center' }}>
              {!installationCompleted && <Spin size='large' tip='Applying config...' style={{ padding: '48px 32px' }} />}
              {(installationCompleted && installationSucceeded && !healthCheckCompleted) && <Spin
                size='large'
                tip='Installing integration...'
                style={{ padding: '48px 32px' }} />}
              {(installationCompleted && installationQueued) && <Result
                status="success"
                title="Success"
                subTitle="Installation queued successfully"
                extra={[<BackToIntegrationsPageButton />]} />}
              {(installationCompleted && !installationQueued && !installationSucceeded) && <Result
                status="error"
                title="Error"
                subTitle="Error in installing integration"
                extra={[<RetryInstallationButton />, <BackToIntegrationsPageButton />]} />}
              {(installationCompleted && installationSucceeded && healthCheckCompleted && !healthCheckPassed) && <Result
                status="error"
                title="Error"
                subTitle="Error in getting installation console ready"
                extra={[<RetryInstallationButton />, <BackToIntegrationsPageButton />]} />}
              {(installationCompleted && installationSucceeded && healthCheckCompleted && healthCheckPassed) && <Result
                status="success"
                title="Success"
                subTitle="Integration installed successfully"
                extra={[<OpenConsoleButton />, <BackToIntegrationsPageButton />]} />}
            </Card>
          </Col>
        </Row>
    }];

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.INTEGRATIONS} />
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