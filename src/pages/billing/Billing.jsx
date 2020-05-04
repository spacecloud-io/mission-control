import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { increment, decrement, set } from 'automate-redux';
import ReactGA from 'react-ga';
import { Row, Col } from 'antd';
import { notify, isSignedIn, getClusterPlan, isBillingEnabled } from '../../utils';
import client from '../../client';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import SelectPlan from '../../components/billing/select-plan/SelectPlan';
import FAQ from '../../components/billing/faq/FAQ';
import ContactUs from '../../components/billing/contact/ContactUs';
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
  const [contactModalVisible, setContactModalVisible] = useState(false)
  const [billingDetailsModalVisible, setBillingDetailsModalVisible] = useState(false);
  const [defaultSubject, setDefaultSubject] = useState("")
  const signedIn = isSignedIn()
  const selectedPlan = useSelector(state => getClusterPlan(state))
  const dispatch = useDispatch();
  const billingEnabled = useSelector(state => isBillingEnabled(state))
  useEffect(() => {
    if (billingEnabled) {
      history.push(`/mission-control/projects/${projectID}/billing/overview`)
    }
  }, [billingEnabled])

  const handleRequestFreeTrial = () => {
    setContactModalVisible(true);
    setDefaultSubject("Free trial for Space Cloud Pro");
  }

  const handleDiscount = () => {
    setContactModalVisible(true);
    setDefaultSubject("Request discount for Space Cloud Pro");
  }

  const handleCancel = () => {
    setContactModalVisible(false)
  }

  const handleContactUs = (subject, message) => {
    dispatch(increment("pendingRequests"));
    const email = localStorage.getItem('email')
    const name = localStorage.getItem('name')
    client.billing.contactUs(email, name, subject, message).then(res => {
      if (res === 200) {
        setContactModalVisible(false)
        notify("success", "Successfully sent message", "Our team will reach out to you shortly:)")
      }
    }).catch(ex => {
      console.log(ex)
      notify("error", "Error sending message", ex)
    }).finally(() => dispatch(decrement("pendingRequests")))
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
        <Row>
          {selectedPlan === "open" && <Col lg={{ span: 24 }}>
            <h3 style={{ marginBottom: "0", fontSize: "21px" }}>Upgrade cluster</h3>
            <p style={{ marginBottom: "24px" }}>This Space Cloud cluster is operating in opensource mode right now. Upgrade the cluster to a paid plan to get increased limits for the cluster</p>
            <SelectPlan
              selectedPlan={selectedPlan}
              handleSelectPlan={(plan) => history.push(`/mission-control/projects/${projectID}/billing/upgrade-cluster`, { plan })}
              handleContactUs={() => history.push(`/mission-control/projects/${projectID}/billing/contact-us`)} />
          </Col>}
          {selectedPlan !== "open" && <Col lg={{ span: 11 }}>
            <PlanDetails plan={selectedPlan} handleChangePlan={() => notify("info", "Signin required", "You need to signin first to change plan")} />
          </Col>}
        </Row>
        <Row>
          <Col lg={{ span: 18 }}>
            <FAQ handleRequestFreeTrial={handleRequestFreeTrial} handleDiscount={handleDiscount} />
          </Col>
        </Row>
        {contactModalVisible && <ContactUs
          initialvalues={defaultSubject}
          handleContactUs={handleContactUs}
          handleCancel={handleCancel} />}
        {billingDetailsModalVisible && <AddBillingDetailsModal handleCancel={() => setBillingDetailsModalVisible(false)} />}
        <ContactUsFab />
      </div>
    </div>
  )
}

export default Billing;