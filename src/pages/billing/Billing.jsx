import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { set } from 'automate-redux';
import ReactGA from 'react-ga';
import { Row, Col } from 'antd';
import { notify, isSignedIn, getClusterPlan, isBillingEnabled } from '../../utils';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import SelectPlan from '../../components/billing/select-plan/SelectPlan';
import FAQ from '../../components/billing/faq/FAQ';
import Signin from '../../components/billing/setup-card/Signin';
import SetupBilling from '../../components/billing/setup-card/SetupBilling';
import AddBillingDetailsModal from "../../components/billing/add-billing-details/AddBillingDetailsModal";
import PlanDetails from '../../components/billing/plan/PlanDetails';
import './billing.css';
import ContactUsFab from "../../components/billing/contact-us/ContactUsFab";

const Billing = () => {

  useEffect(() => {
    ReactGA.pageview("/projects/billing");
  }, [])

  const { projectID } = useParams();
  const history = useHistory();
  const [billingDetailsModalVisible, setBillingDetailsModalVisible] = useState(false);
  const signedIn = isSignedIn()
  const selectedPlan = useSelector(state => getClusterPlan(state))
  const dispatch = useDispatch();
  const billingEnabled = useSelector(state => isBillingEnabled(state))
  useEffect(() => {
    if (billingEnabled) {
      history.push(`/mission-control/projects/${projectID}/billing/overview`)
    }
  }, [billingEnabled])

  const handleDiscount = () => {
    history.push(`/mission-control/projects/${projectID}/billing/contact-us`, { subject: "Request discount for Space Cloud Pro" })
  }

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="billing" />
      <div className='page-content'>
        <Row style={{ marginBottom: "48px" }}>
          <Col lg={{ span: 12 }}>
            {signedIn && <SetupBilling handleSetupBilling={() => setBillingDetailsModalVisible(true)} />}
            {!signedIn && <Signin handleSignin={() => dispatch(set("uiState.showSigninModal", true))} />}
          </Col>
        </Row>
        {selectedPlan.startsWith("space-cloud-open") && <Row>
          <Col lg={{ span: 24 }}>
            <h3 style={{ marginBottom: "0", fontSize: "21px" }}>Upgrade cluster</h3>
            <p style={{ marginBottom: "24px" }}>This Space Cloud cluster is operating in opensource mode right now. Upgrade the cluster to a paid plan to get increased limits for the cluster</p>
            <SelectPlan
              selectedPlan={selectedPlan}
              handleSelectPlan={(plan) => history.push(`/mission-control/projects/${projectID}/billing/upgrade-cluster`, { plan })}
              handleContactUs={() => history.push(`/mission-control/projects/${projectID}/billing/contact-us`)} />
          </Col>
          <Col lg={{ span: 18 }}>
            <FAQ handleDiscount={handleDiscount} />
          </Col>
        </Row>}
        {!selectedPlan.startsWith("space-cloud-open") && <Row>
          <Col lg={{ span: 11 }}>
            <PlanDetails plan={selectedPlan} handleChangePlan={() => notify("info", "Signin required", "You need to signin first to change plan")} />
          </Col>
        </Row>}
        {billingDetailsModalVisible && <AddBillingDetailsModal handleCancel={() => setBillingDetailsModalVisible(false)} />}
        <ContactUsFab />
      </div>
    </div>
  )
}

export default Billing;