import React from 'react';
import VerifyEmail from '../../components/signup/verify/VerifyEmail';
import './email-verify.css';
import { Row, Col } from 'antd';
import history from '../../history';
import * as firebase from "firebase/app";
import "firebase/auth";

const EmailVerification = () => {

    const sendEmailVerification = () => {
        firebase.auth().currentUser.sendEmailVerification().then(() => {
            console.log('again email sent')
        }).catch((error) => {
            console.log(error)
        })
    }
    return(
        <div className="verify-background">
            <Row>
                <Col lg={{ span:10, offset:7 }} className="verify-card">
                    <VerifyEmail 
                    verify={sendEmailVerification}
                    redirect={() => history.push('/mission-control/login')}/>
                </Col>
            </Row>
        </div>
    );
}

export default EmailVerification;