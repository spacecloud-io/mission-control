import React from 'react';
import { Row, Col, Input, Form, Button, Divider } from 'antd';
import googleIcon from '../../../assets/googleIcon.svg';
import githubIcon from '../../../assets/githubIcon.svg';
import twitterIcon from '../../../assets/twitter1.svg';
import { Link } from 'react-router-dom';
import './login-form.css';

const LoginForm = (props) => {
    const [form] = Form.useForm();

    const handleSubmit = e => {
        form.validateFields().then(values => {
            props.handleSubmit(values.email, values.key);
        });
    };

    return (
        <Row className="login-content">
            <Col lg={{ span: 16, offset: 4 }} >
                <h2 className="title">Login</h2>
                <Row>
                    <Col xs={{ span: 5, offset: 5 }} style={{ marginBottom: "5%" }}>
                        <img src={googleIcon} width="48px" height="48px" onClick={props.google} />
                    </Col>
                    <Col xs={{ span: 5 }}>
                        <img src={githubIcon} width="48px" height="48px" onClick={props.github} />
                    </Col>
                    <Col xs={{ span: 5 }}>
                        <img src={twitterIcon} width="48px" height="48px" onClick={props.twitter} />
                    </Col>
                </Row>
                <Divider className="divider">OR</Divider><br />
                <Form form={form}>
                    <Form.Item name="email" rules={[{ required: true, message: "Please enter your email" }]}>
                        <Input placeholder="Email" />)}
                    </Form.Item>
                    <Form.Item name="key" rules={[{ required: true, message: "Please enter your password" }]}>
                        <Input.Password placeholder="Password" />
                    </Form.Item>
                    <Button type="primary" className="login-btn" onClick={handleSubmit}>Login</Button>
                </Form>
                <p style={{ marginBottom: "13%", marginTop: "8px" }}>No credit card required</p>
                <Link to="/mission-control/signup">Don’t have an account? Signup</Link>
            </Col>
        </Row>
    );
}

export default LoginForm;