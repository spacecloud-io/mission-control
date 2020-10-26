import React from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LeftOutlined } from '@ant-design/icons';
import { Row, Col, Button } from 'antd';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import TriggerForm from "../../../components/eventing/TriggerForm";
import { getEventSourceFromType, incrementPendingRequests, decrementPendingRequests, notify } from "../../../utils";
import { triggerCustomEvent, getEventingTriggerRules } from '../../../operations/eventing';
import { getAPIToken } from '../../../operations/projects';
import { projectModules } from '../../../constants';

const QueueEvent = () => {
  const { projectID } = useParams()
  const { state } = useLocation()
  const history = useHistory()

  const initialEventType = state.eventType;

  // Global state
  const eventTriggerRules = useSelector(state => getEventingTriggerRules(state))
  const internalToken = useSelector(state => getAPIToken(state, projectID))

  // Derived state
  const customEventTypes = Object.values(eventTriggerRules).filter(({ type }) => getEventSourceFromType(type) === "custom").map(obj => obj.type)

  // Handlers
  const handleTriggerEvent = (type, payload, isSynchronous, token) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      triggerCustomEvent(projectID, type, payload, isSynchronous, token)
        .then((data) => {
          notify("success", "Success", "Event successfully queued to Space Cloud")
          resolve(data)
        })
        .catch(ex => {
          notify("error", "Error queuing event", ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }
  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
      />
      <div>
        <Sidenav selectedItem={projectModules.EVENTING} />
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
                  projectId={projectID}
                  initialEventType={initialEventType}
                  eventTypes={customEventTypes}
                  handleSubmit={handleTriggerEvent}
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
