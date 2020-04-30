import React, { useEffect, useState } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import SelectPlan from '../../components/billing/select-plan/SelectPlan';
import FAQ from '../../components/billing/faq/FAQ';
import { Row, Col } from 'antd';
import ContactUs from '../../components/billing/contact/ContactUs';
import client from '../../client';
import { notify } from '../../utils';
import { increment, decrement } from 'automate-redux';
import { useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import './billing.css';

const Billing = () => {

  useEffect(() => {
    ReactGA.pageview("/projects/billing");
  }, [])

  useEffect(() => {
    ReactGA.pageview("/projects/billing");
  }, [])

  const { projectID } = useParams();
  const history = useHistory();
  const [contactModalVisible, setContactModalVisible] = useState(false)
  const [defaultSubject, setDefaultSubject] = useState("")
  const dispatch = useDispatch();



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
        <Row>
          <Col lg={{ span: 24 }}>
            <h3 style={{ marginBottom:"0", fontSize:"21px"}}>Upgrade cluster</h3>
            <p style={{ marginBottom:"24px"}}>This Space Cloud cluster is operating in opensource mode right now. Upgrade the cluster to a paid plan to get increased limits for the cluster</p>
            <SelectPlan selectedPlan="team" handleChangePlan={() => history.push(`/mission-control/projects/${projectID}/billing/upgrade-cluster`)} />
          </Col>
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
      </div>
    </div>
  )
}

export default Billing;