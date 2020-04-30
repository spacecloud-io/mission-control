import React, { useEffect, useState } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import BillingTabs from '../../components/billing/billing-tabs/BillingTabs';
import PlanDetails from '../../components/billing/plan/PlanDetails';
import BillingDetails from '../../components/billing/billing-details/BillingDetails';
import { Row, Col } from 'antd';
import BalanceCredit from '../../components/billing/balance-credit/BalanceCredit';
import ContactUs from '../../components/billing/contact/ContactUs';
import client from '../../client';
import { notify } from '../../utils';
import { increment, decrement } from 'automate-redux';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import './billing.css';

const BillingOverview = () => {
  useEffect(() => {
    ReactGA.pageview("/projects/billing/overview");
  }, [])

  const { projectID } = useParams();
  const quotas = useSelector(state => state.quotas)
  const [contactModalVisible, setContactModalVisible] = useState(false)
  const [defaultSubject, setDefaultSubject] = useState("")
  const dispatch = useDispatch();

  const handleIncreaseLimit = () => {
    setContactModalVisible(true);
    setDefaultSubject("Increase Space Cloud Pro limits");
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
      <div className='page-content page-content--no-padding'>
        <BillingTabs activeKey="overview" projectID={projectID} />
        <div className="billing-tab-content">
          <Row>
            <Col lg={{ span: 11 }}>
              <BillingDetails />
            </Col>
            <Col lg={{ span: 11, offset: 2 }}>
              <BalanceCredit />
            </Col>
          </Row>
          <Row>
            <Col lg={{ span: 11 }}>
              <PlanDetails handleIncreaseLimit={handleIncreaseLimit} {...quotas} />
            </Col>
          </Row>
        </div>
        {contactModalVisible && <ContactUs
          initialvalues={defaultSubject}
          handleContactUs={handleContactUs}
          handleCancel={handleCancel} />}
      </div>
    </div>
  )
}

export default BillingOverview;