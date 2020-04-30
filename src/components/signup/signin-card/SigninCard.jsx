import React from 'react';
import { Card, Row, Col } from 'antd';
import googleIcon from '../../../assets/googleIcon.svg';
import twitterIcon from '../../../assets/twitter.svg';
import githubIcon from '../../../assets/github.svg';
import './signin-card.css';
import useEventListener from "@use-it/event-listener"

const SigninCard = (props) => {
  useEventListener("message", messageHandler)
  const messageHandler = (event) => {
    console.log("Event", event)
    if (event.origin !== "http://localhost:5000") {
      return;
    }

    props.handleSignin(event.data.token)
  }

  const openSigninPage = (provider) => {
    const signinPageURL = `http://localhost:5000/${provider}` 
    window.open(signinPageURL)
  }
  return (
    <Card bordered={false} className="signin-card">
      <p style={{ fontSize: '16px' }}>Continue with one of your favourite accounts</p>
      <Row>
        <Col xs={{ span: 18, offset: 3 }}>
          <Card className="vendor-card google" onClick={() => openSigninPage("google")}>
            <img src={googleIcon} height="32px" width="32px" />
            <span className="vendor-text">Sign in with Google</span>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={{ span: 18, offset: 3 }}>
          <Card className="vendor-card twitter" onClick={() => openSigninPage("twitter")}>
            <img src={twitterIcon} height="32px" width="32px" />
            <span className="vendor-text">Sign in with Twitter</span>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={{ span: 18, offset: 3 }}>
          <Card className="vendor-card github" onClick={() => openSigninPage("github")}>
            <img src={githubIcon} height="32px" width="32px" />
            <span className="vendor-text">Sign in with Github</span>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

export default SigninCard;