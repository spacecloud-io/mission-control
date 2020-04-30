import React, { useEffect, useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import SelectPlan from '../../components/billing/select-plan/SelectPlan';   
import ReactGA from 'react-ga';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Icon, Col, Row } from 'antd';
import './billing.css';

const ChangePlan = () => {

  useEffect(() => {
    ReactGA.pageview("/projects/billing/change-plan");
  }, [])

  const { projectID } = useParams();
  const history = useHistory();

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <div>
        <Sidenav selectedItem='billing' />
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
            <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/billing/overview`)}>
              <Icon type="left" />
                            Go back
                            </Button>
            <span style={{ marginLeft: '35%' }}>
              Change plan
                            </span>
          </div><br />
          <div style={{ marginLeft:"32px" }}>
            <Row>
                <Col lg={{ span: 24 }}>
                    <h3 style={{ marginBottom:"0", fontSize:"21px"}}>Change plan</h3>
                    <p style={{ marginBottom:"24px"}}>This Space Cloud cluster is operating in Teams plan right now. Change it to any other plan suitable as per your needs.</p>
                    <SelectPlan selectedPlan="team" handleChangePlan={() => history.push(`/mission-control/projects/${projectID}/billing/upgrade-cluster`)} />
                </Col>
            </Row>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ChangePlan;