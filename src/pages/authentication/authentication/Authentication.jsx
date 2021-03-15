import React from 'react';
import { Row, Col, Card } from 'antd';
import './authentication.css';
import Content from '../../../components/authentication/content/Content';
import SignupForm from '../../../components/authentication/signup/SignupForm';
import SigninForm from '../../../components/authentication/signin/SigninForm';
import { incrementPendingRequests, decrementPendingRequests, notify } from '../../../utils';
import firebase from 'firebase/app';
import 'firebase/auth';

const Authentication = ({ mode }) => {

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const twitterProvider = new firebase.auth.TwitterAuthProvider();
  const githubProvider = new firebase.auth.GithubAuthProvider();

  const enterpriseSignin = () => {
    
  }

  const handleGoogleSignin = () => {
    incrementPendingRequests();
    firebase.auth().signInWithPopup(googleProvider).then((res) => {
      res.user.getIdToken().then(token => {
        enterpriseSignin(token).then(() => {
          notify("success", "Success", "Signin successful")
        }).catch(ex => notify("error", "Signin failed", ex.toString()))
      }).catch(ex => notify("error", "Signin failed", ex.toString()))
    }).catch((error) => {
      notify("error", "Signin failed", error.toString())
    }).finally(() => decrementPendingRequests());
  }

  const handleGithubSignin = () => {
    incrementPendingRequests();
    firebase.auth().signInWithPopup(githubProvider).then((res) => {
      res.user.getIdToken().then(token => {
        enterpriseSignin(token).then(() => {
          notify("success", "Success", "Signin successful")
        }).catch(ex => notify("error", "Signin failed", ex.toString()))
      }).catch(ex => notify("error", "Signin failed", ex.toString()))
    }).catch((error) => {
      notify("error", "Signin failed", error.toString())
    }).finally(() => decrementPendingRequests());
  }

  const handleTwitterSignin = () => {
    incrementPendingRequests();
    firebase.auth().signInWithPopup(twitterProvider).then((res) => {
      res.user.getIdToken().then(token => {
        enterpriseSignin(token).then(() => {
          notify("success", "Success", "Signin successful")
        }).catch(ex => notify("error", "Signin failed", ex.toString()))
      }).catch(ex => notify("error", "Signin failed", ex.toString()))
    }).catch((error) => {
      notify("error", "Signin failed", error.toString())
    }).finally(() => decrementPendingRequests());
  }

  const handleSignup = () => {

  }
  const handleSignin = () => {

  }
  return(
    <Row className="dark-background">
      <Col xs={{ span: 22, offset: 1 }} lg={{ span: 20, offset: 2 }}>
        <Card className="card-content">
          <Row type="flex" align="middle">
            <Col xs={{ span: 0 }} lg={{ span: 12, offset: 0 }} style={{ alignSelf: "stretch" }}>
              <Content />
            </Col>
            <Col xs={{ span: 24 }} lg={{ span: 12, offset: 0 }} style={{ alignSelf: "stretch", width: '100%' }}>
              {mode === 'signup' && <SignupForm handleSubmit={handleSignup}
                google={handleGoogleSignin}
                twitter={handleTwitterSignin}
                github={handleGithubSignin} />}
              {mode === 'signin' && <SigninForm handleSubmit={handleSignin}
                google={handleGoogleSignin}
                twitter={handleTwitterSignin}
                github={handleGithubSignin} />}
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

export default Authentication;