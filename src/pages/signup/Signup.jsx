import React, {useState} from 'react';
import { Row, Col, Card } from 'antd';
import Content from '../../components/signup/content/Content';
import SignupForm from '../../components/signup/signup/SignupForm';
import LoginForm from '../../components/signup/login/LoginForm';
import logo from '../../assets/logo-white.svg';
import './signup.css';
import { useRouteMatch } from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";
import history from '../../history';
import client from '../../client';
import {enterpriseSignin, notify} from '../../utils';
import store from '../../store';
import {increment, decrement} from 'automate-redux';

const Signup = () => {
    let match = useRouteMatch();
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const twitterProvider = new firebase.auth.TwitterAuthProvider();
    const githubProvider = new firebase.auth.GithubAuthProvider();
    
    const handleGoogleSignin = () => {
        firebase.auth().signInWithPopup(googleProvider).then((userInfo) =>{
            enterpriseSignin(userInfo.user.refreshToken)
        }).catch((error) => {
            console.log(error);
        })
    }

    const handleTwitterSignin = () => {
        firebase.auth().signInWithPopup(twitterProvider).then((userInfo) =>{
            enterpriseSignin(userInfo.user.refreshToken)
        }).catch((error) => {
            console.log(error);
        })
    }

    const handleGithubSignin = () => {
        firebase.auth().signInWithPopup(githubProvider).then((userInfo) =>{
            enterpriseSignin(userInfo.user.refreshToken)
        }).catch((error) => {
            console.log(error);
        })
    }

    const handleSignup = (username, email, password) => {
        store.dispatch(increment("pendingRequests"))
        firebase.auth().createUserWithEmailAndPassword(email, password).then((userInfo) => {
            userInfo.user.updateProfile({displayName: username}).catch((error) => console.log(error))
            userInfo.user.sendEmailVerification().catch(error => console.log(error))
            notify("success", "Success", "Signup successful")
            history.push('/mission-control/email-verification');
        }).catch((error) => {
            console.log(error)
            notify("error", "Signup failed", error)
        }).finally(() => store.dispatch(decrement("pendingRequests")));    
    }

    const handleSignin = (email, password) => {
        store.dispatch(increment("pendingRequests"))
        firebase.auth().signInWithEmailAndPassword(email, password).then((userInfo) =>{
            if(userInfo.user.emailVerified){
                enterpriseSignin(userInfo.user.refreshToken)
                notify("success", "Success", "Signup successful")
            }else{
                history.push("/mission-control/email-verification")
            }
        })
        .catch((error) => {
            console.log(error)
            notify("error", "Signup failed", error)
          }).finally(() => store.dispatch(decrement("pendingRequests")));
    } 

    return (
        <Row className="dark-background">
            <img src={logo} className="logo"/>
            <Col lg={{ span:20, offset:2 }} >
                <Card className="card-content">
                    <Row type="flex" align="middle">
                        <Col lg={{ span:12,offset:0 }} xs={{ span:0 }} style={{ alignSelf:"stretch" }}>
                            <Content />
                        </Col>
                        <Col lg={{ span:12,offset:0 }} xs={{ span:24 }}>
                            {match.path === '/mission-control/signup' && 
                                <SignupForm handleSubmit={handleSignup} 
                                google={handleGoogleSignin}
                                twitter={handleTwitterSignin}
                                github={handleGithubSignin} />}
                            {match.path === '/mission-control/login' && 
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