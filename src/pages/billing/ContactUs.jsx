import React, { useEffect } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import { useHistory } from 'react-router-dom';
import { useDispatch } from "react-redux"
import { Button } from 'antd';
import ContactForm from '../../components/billing/contact-us/ContactForm';
import MessageCard from '../../components/billing/contact-us/MessageCard';
import './billing.css';
import { increment, decrement } from 'automate-redux';
import client from "../../client"
import { notify } from '../../utils';
import { LeftOutlined } from "@ant-design/icons"

const UpgradeCluster = (props) => {

  useEffect(() => {
    ReactGA.pageview("projects/billing/contact-us");
  }, [])

  const dispatch = useDispatch()
  const history = useHistory();
  const subject = props.location.state ? props.location.state.subject : undefined
  const email = localStorage.getItem("email") ? localStorage.getItem("email") : undefined
  const handleSendMessage = (email, subject, message) => {
    const name = localStorage.getItem("name")
    dispatch(increment("pendingRequests"))
    client.billing.contactUs(email, name, subject, message)
      .then(() => {
        notify("success", "Success", "Successfully sent message. Our team will reach out to you shortly")
        history.goBack()
      })
      .catch(ex => notify("error", "Error sending message", ex))
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
            justifyContent: "center",
            padding: "0 16px"
          }}>
            <Button style={{ position: "absolute", left: 0 }} type="link" onClick={history.goBack}>
            <LeftOutlined />Go back</Button>
            <span >Contact us</span>
          </div><br />
          <div>
            <MessageCard />
            <ContactForm email={email} subject={subject} handleSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default UpgradeCluster;