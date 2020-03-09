import React from 'react';
import './email-verify.css';
import { Row, Col, Card, Icon, Button } from 'antd';
import history from '../../history';
import {Link} from 'react-router-dom'
import * as firebase from "firebase/app";
import "firebase/auth";
import store from '../../store';
import {increment, decrement} from 'automate-redux';
import {notify} from '../../utils';

const EmailVerification = () => {

    const sendEmailVerification = () => {
        store.dispatch(increment("pendingRequests"))
        firebase.auth().currentUser.sendEmailVerification().then(() => {
            notify("success", "Success", "Send email verification successful")
        }).catch((error) => {
            console.log(error)
            notify("error", "Error in sending email verification", error)
        }).finally(() => store.dispatch(decrement("pendingRequests")));
    }
    return(
        <Row className="verify-background">
            <Col lg={{ span:10, offset:7 }} className="verify-card">
                <Card style={{ padding:"32px" }}>
                    <Icon type="mail" style={{ fontSize:"30px", fontWeight:"bold", marginBottom:"2%" }} />
                    <h2><b>Email verification pending</b></h2>
                    <p style={{marginBottom:0, marginTop:"2%"}}>We have sent an verification link to your email. Please verify it to login.</p>
                    <p style={{marginTop:0}}>Did not receive an email? <Link onClick={sendEmailVerification}> Resend verification link </Link></p>
                    <Button type='primary' ghost style={{ marginTop:"3%", width:"50%", minWidth:"200px" }} onClick={() => history.push('/mission-control/signin')}> Take me to Login page</Button>
                </Card>
            </Col>
        </Row>
    );
}

export default EmailVerification;