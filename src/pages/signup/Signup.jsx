import React from 'react';
import { Row, Col, Card } from 'antd';
import Content from '../../components/signup/content/Content';
import SignupForm from '../../components/signup/signup/SignupForm';
import LoginForm from '../../components/signup/login/LoginForm';
import logo from '../../assets/logo-white.svg';
import './signup.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import history from '../../history';
import { enterpriseSignin, notify, storeFirebaseToken } from '../../utils';
import store from '../../store';
import { increment, decrement } from 'automate-redux';

const Signup = (props) => {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const twitterProvider = new firebase.auth.TwitterAuthProvider();
    const githubProvider = new firebase.auth.GithubAuthProvider();

    const handleGoogleSignin = () => {
        store.dispatch(increment("pendingRequests"))
        firebase.auth().signInWithPopup(googleProvider).then((res) => {
            res.user.getIdToken().then(token => {
                enterpriseSignin(token).then(() => {
                    notify("success", "Success", "Signin successful")
                }).catch(ex => notify("error", "Signin failed", ex.toString()))

            }).catch(ex => notify("error", "Signin failed", ex.toString()))
        }).catch((error) => {
            console.log(error);
            notify("error", "Signin failed", error.toString())
        }).finally(() => store.dispatch(decrement("pendingRequests")));
    }

    const handleTwitterSignin = () => {
        store.dispatch(increment("pendingRequests"))
        firebase.auth().signInWithPopup(twitterProvider).then((res) => {
            res.user.getIdToken().then(token => {
                enterpriseSignin(token).then(() => {
                    notify("success", "Success", "Signin successful")
                }).catch(ex => notify("error", "Signin failed", ex.toString()))

            }).catch(ex => notify("error", "Signin failed", ex.toString()))
        }).catch((error) => {
            console.log(error);
            notify("error", "Signin failed", error.toString())
        }).finally(() => store.dispatch(decrement("pendingRequests")));
    }

    const handleGithubSignin = () => {
        store.dispatch(increment("pendingRequests"))
        firebase.auth().signInWithPopup(githubProvider).then((res) => {
            res.user.getIdToken().then(token => {
                enterpriseSignin(token).then(() => {
                    notify("success", "Success", "Signin successful")
                }).catch(ex => notify("error", "Signin failed", ex.toString()))

            }).catch(ex => notify("error", "Signin failed", ex.toString()))
        }).catch((error) => {
            console.log(error);
            notify("error", "Signin failed", error.toString())
        }).finally(() => store.dispatch(decrement("pendingRequests")));
    }

    const handleSignup = (username, email, password) => {
        store.dispatch(increment("pendingRequests"))
        firebase.auth().createUserWithEmailAndPassword(email, password).then((res) => {
            res.user.updateProfile({ displayName: username }).catch((error) => console.log(error))
            res.user.sendEmailVerification().catch(error => console.log(error))
            res.user.getIdToken().then(token => storeFirebaseToken(token)).catch(ex => notify("error", "Signin failed", ex.toString()))
            notify("success", "Success", "Signup successful")
            history.push('/mission-control/email-verification');
        }).catch((error) => {
            console.log(error)
            notify("error", "Signup failed", error.toString())
        }).finally(() => store.dispatch(decrement("pendingRequests")));
    }

    const handleSignin = (email, password) => {
        store.dispatch(increment("pendingRequests"))
        firebase.auth().signInWithEmailAndPassword(email, password).then((res) => {
            res.user.getIdToken().then(token => {
                enterpriseSignin(token).then(() => {
                    notify("success", "Success", "Signin successful")
                }).catch(ex => notify("error", "Signin failed", ex.toString()))
            }).catch(ex => notify("error", "Signin failed", ex.toString()))
        })
            .catch((error) => {
                console.log(error)
                notify("error", "Signin failed", error.toString())
            }).finally(() => store.dispatch(decrement("pendingRequests")));
    }

    return (
        <Row className="dark-background">
            <img src={logo} className="logo" />
            <Col lg={{ span: 20, offset: 2 }} className="signup-card">
                <Card className="card-content">
                    <Row type="flex" align="middle">
                        <Col lg={{ span: 12, offset: 0 }} xs={{ span: 0 }} style={{ alignSelf: "stretch" }}>
                            <Content />
                        </Col>
                        <Col lg={{ span: 12, offset: 0 }} xs={{ span: 24 }}>
                            {props.mode === 'signup' &&
                                <SignupForm handleSubmit={handleSignup}
                                    google={handleGoogleSignin}
                                    twitter={handleTwitterSignin}
                                    github={handleGithubSignin} />}
                            {props.mode === 'signin' &&
                                <LoginForm handleSubmit={handleSignin}
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

export default Signup;