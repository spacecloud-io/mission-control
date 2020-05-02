import React, { useEffect, useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import SelectPlan from '../../components/billing/select-plan/SelectPlan';
import ReactGA from 'react-ga';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { Button, Icon, Col, Row } from 'antd';
import './billing.css';
import { setClusterPlan, notify, capitalizeFirstCharacter, getClusterPlan } from '../../utils';
import { increment, decrement } from 'automate-redux';

const ChangePlan = () => {
  const dispatch = useDispatch()
  const history = useHistory();
  useEffect(() => {
    ReactGA.pageview("/projects/billing/change-plan");
  }, [])
  
  const selectedPlan = useSelector(state => getClusterPlan(state))
  const handleSelectPlan = (plan) => {
    dispatch(increment("pendingRequests"))
    setClusterPlan(plan).then(() => {
      const planName = capitalizeFirstCharacter(plan)
      notify("success", "Success", `Successfully change plan of this cluster to ${planName} plan`)
      history.goBack()
    })
    .catch(ex => notify("error", "Error changing plan", ex))
    .finally(() => dispatch(decrement("pendingRequests")))
  }

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
            <Button type="link" onClick={history.goBack}>
              <Icon type="left" />
                Go back
            </Button>
            <span style={{ marginLeft: '35%' }}>
              Change plan
                            </span>
          </div><br />
          <div style={{ marginLeft: "32px" }}>
            <Row>
              <Col lg={{ span: 24 }}>
                <h3 style={{ marginBottom: "0", fontSize: "21px" }}>Change plan</h3>
                <p style={{ marginBottom: "24px" }}>This Space Cloud cluster is operating in Teams plan right now. Change it to any other plan suitable as per your needs.</p>
                <SelectPlan selectedPlan={selectedPlan} handleSelectPlan={handleSelectPlan} />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ChangePlan;