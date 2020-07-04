import React, { useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga'
import { useSelector } from 'react-redux';
import { LeftOutlined } from '@ant-design/icons';
import { Row, Col, Button } from 'antd';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import TriggerForm from "../../../components/eventing/TriggerForm";
import { getEventSourceFromType, getProjectConfig, getJWTSecret, generateInternalToken, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import { triggerCustomEvent } from '../../../operations/eventing';

const QueueEvent = () => {
  const { projectID } = useParams()
  const { state } = useLocation()
  const history = useHistory()

  const initialEventType = state.eventType;
  const projects = useSelector(state => state.projects)
  const eventTriggerRules = getProjectConfig(projects, projectID, `modules.eventing.triggers`, {})
  const customEventTypes = Object.values(eventTriggerRules).filter(({ type }) => getEventSourceFromType(type) === "custom").map(obj => obj.type)
  const secret = useSelector(state => getJWTSecret(state, projectID))
  const internalToken = useSelector(state => generateInternalToken(state, projectID))

  useEffect(() => {
    ReactGA.pageview("/projects/eventing/queue-event");
  }, [])

  const handleTriggerEvent = (type, payload, isSynchronous, token) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      triggerCustomEvent(projectID, type, payload, isSynchronous, token)
        .then((data) => resolve(data))
        .catch(() => reject())
        .finally(() => decrementPendingRequests())
    })
  }
  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
      />
      <div>
        <Sidenav selectedItem='eventing' />
        <div className='page-content page-content--no-padding'>
          <div style={{
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
            height: 48,
            lineHeight: 48,
            zIndex: 98,
            display: "flex",
            alignItems: "center",
            padding: "0 16px"
          }}>
            <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/eventing/overview`)}>
              <LeftOutlined />
              Go back
            </Button>
            <span style={{ marginLeft: 16 }}>
              Queue Event
            </span>
          </div>
          <br />
          <div>
            <Row>
              <Col lg={{ span: 18, offset: 3 }} sm={{ span: 24 }} >
                <TriggerForm
                  initialEventType={initialEventType}
                  eventTypes={customEventTypes}
                  handleSubmit={handleTriggerEvent}
                  secret={secret}
                  internalToken={internalToken} />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default QueueEvent;
