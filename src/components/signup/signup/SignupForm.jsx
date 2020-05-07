import React from 'react';
import { Form, Row, Col, Input, Button, Divider } from 'antd';
import googleIcon from '../../../assets/googleIcon.svg';
import githubIcon from '../../../assets/githubIcon.svg';
import twitterIcon from '../../../assets/twitter1.svg';
import { Link } from 'react-router-dom';
import './signup-form.css';

const SignupForm = (props) => {
    const [form] = Form.useForm();

    const handleSubmit = e => {
        form.validateFields().then(values => {
            props.handleSubmit(values.name, values.email, values.key);
        });
    };

    return (
        <Row className="signup-content">
            <Col lg={{ span: 16, offset: 4 }} >
                <h2 className="title">Create an account</h2>
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
                <Divider className="divider">OR</Divider>
                <Form form={form}>
                    <Form.Item name="name" rules={[{ required: true, message: "Please enter your name" }]}>
                        <Input placeholder="Name" />
                    </Form.Item>
                    <Form.Item name="email" rules={[{ required: true, message: "Please enter your email" }]}>
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item name="key" rules={[{
                                validator: (_, value, cb) => {
                                    if (!value) {
                                        cb("Please enter your password")
                                        return
                                    }
                                    if (value.length < 6) {
                                        cb("Password should be atleast 6 characters long")
                                        return
                                    }
                                    cb()
                                }
                            }]}>
                        <Input.Password placeholder="Password" />
                    </Form.Item>
                    <Button type="primary" className="signup-btn" onClick={handleSubmit}>Signup for free</Button>
                </Form>
                <p style={{ marginBottom: "13%", marginTop: "8px" }}>No credit card required</p>
                <Link to="/mission-control/signin">Already have an account? Login</Link>
            </Col>
        </Row>
    );
}

export default SignupForm;