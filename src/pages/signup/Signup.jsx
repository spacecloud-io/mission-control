import React, {useState} from 'react';
import { Row, Col, Card } from 'antd';
import Content from '../../components/signup/content/Content';
import SignupForm from '../../components/signup/signup/SignupForm';
import LoginForm from '../../components/signup/login/LoginForm';
import logo from '../../assets/logo-white.svg';
import './signup.css';
import { useRouteMatch } from 'react-router-dom';

const Signup = () => {
    let match = useRouteMatch();
    
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
                            {match.path === '/mission-control/signup' && <SignupForm />}
                            {match.path === '/mission-control/login' && <LoginForm />}
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row> 
    );
}

export default Signup;