import React, { useEffect, useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Steps, Col, Row } from 'antd';
import SigninCard from '../../components/signup/signin-card/SigninCard';
import AddBillingDetails from '../../components/billing/add-billing-details/AddBillingDetails';
import RegisterCluster from '../../components/billing/upgrade/RegisterCluster';
import ConflictedClusterIdModal from '../../components/billing/upgrade/ConflictedClusterIdModal';
import StartSubscription from '../../components/billing/upgrade/StartSubscription';
import { notify, isSignedIn, isBillingEnabled, enterpriseSignin, getClusterId, registerCluster } from '../../utils';
import { increment, decrement } from 'automate-redux';
import { useDispatch, useSelector } from 'react-redux';
import { LeftOutlined } from "@ant-design/icons"

import './billing.css';

const UpgradeCluster = (props) => {
  useEffect(() => {
    ReactGA.pageview("/projects/billing/upgrade");
  }, [])

  const { projectID } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const signedIn = isSignedIn()
  const billingEnabled = useSelector(state => isBillingEnabled(state))
  const countryCode = useSelector(state => state.billing.details.country) 
  const clusterId = useSelector(state => getClusterId(state))
  const clusterRegistered = clusterId ? true : false
  const initialStep = clusterRegistered ? 3 : (billingEnabled ? 2 : (signedIn ? 1 : 0))
  const [current, setCurrent] = useState(initialStep);
  const [conflictedClusterName, setConflictedClusterName] = useState(null)
  const { Step } = Steps;
  const plan = props.location.state.plan

  useEffect(() => {
    if (billingEnabled && current < 2) {
      setCurrent(2)
    }
  }, [billingEnabled])

  useEffect(() => {
    if (clusterRegistered && current < 3) {
      setCurrent(3)
    }
  }, [clusterRegistered])

  const handleSignin = (firebaseToken) => {
    dispatch(increment("pendingRequests"))
    enterpriseSignin(firebaseToken)
      .then(() => setCurrent(1))
      .catch(ex => notify("error", "Error in signin", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const handleBillingSuccess = () => {
    notify("success", "Success", "Saved billing details successfully")
    setCurrent(2)
  }

  const handleRegisterCluster = (clusterName, doesExist, onRegisteredCallback) => {
    dispatch(increment("pendingRequests"))
    registerCluster(clusterName, doesExist)
      .then(({ registered, notifiedToCluster, exceptionNotifyingToCluster }) => {
        if (!registered) {
          setConflictedClusterName(clusterName)
          return
        }
        if (onRegisteredCallback) onRegisteredCallback()
        if (!notifiedToCluster) {
          notify("error", "Error registering cluster", exceptionNotifyingToCluster)
          return
        }
        notify("success", "Success", "Successfully registered cluster")
        setCurrent(3)
      })
      .catch(ex => notify("error", "Error registering cluster", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const steps = [{
    title: 'Create account',
    content: <React.Fragment>
      <Row>
        <Col xl={{ span: 10, offset: 7 }} lg={{ span: 18, offset: 3 }}>
          <SigninCard handleSignin={handleSignin} />
        </Col>
      </Row>
    </React.Fragment>
  },
  {
    title: 'Add billing details',
    content: <Row>
      <Col xl={{ span: 10, offset: 7 }} lg={{ span: 18, offset: 3 }}>
        <AddBillingDetails handleSuccess={handleBillingSuccess} />
      </Col>
    </Row>
  },
  {
    title: 'Register cluster',
    content: <React.Fragment>
      <RegisterCluster handleRegisterCluster={(clusterName) => handleRegisterCluster(clusterName, false)} />
    </React.Fragment>
  },
  {
    title: 'Start subscription',
    content: <React.Fragment>
      <StartSubscription countryCode={countryCode} plan={plan} handleSuccess={() => history.push(`/mission-control/projects/${projectID}/billing/overview`)} />
    </React.Fragment>
  }]

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
            <LeftOutlined />
                            Go back
                            </Button>
            <span style={{ marginLeft: '35%' }}>
              Upgrade Cluster
                            </span>
          </div><br />
          <div>
            <Row>
              <Col xl={{ span: 14, offset: 5 }} lg={{ span: 20, offset: 2 }} xs={{ span: 24 }} >
                <Steps current={current} className="upgrade-steps" size="small">
                  {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                  ))}
                </Steps><br />
              </Col>
            </Row>
            {steps[current].content}
          </div>
        </div>
      </div>
      {conflictedClusterName && <ConflictedClusterIdModal
        clusterName={conflictedClusterName}
        handleCancel={() => setConflictedClusterName(null)}
        handleContinue={() => handleRegisterCluster(conflictedClusterName, true, () => setConflictedClusterName(null))}
      />}
    </React.Fragment>
  );
}

export default UpgradeCluster;