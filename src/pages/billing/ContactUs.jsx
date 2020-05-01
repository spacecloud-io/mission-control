import React, { useEffect, useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Icon, Col, Row } from 'antd';
import ContactForm from '../../components/billing/contact-us/ContactForm';
import MessageCard from '../../components/billing/contact-us/MessageCard';
import './billing.css';

const UpgradeCluster = () => {

  useEffect(() => {
    ReactGA.pageview("/projects/contact-us");
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
              Contact us
                            </span>
          </div><br />
          <div>
            <MessageCard />
            <ContactForm />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default UpgradeCluster;