import React from 'react';
import { Row, Col, Form, Input, Button, Divider } from 'antd';
import googleIcon from '../../../assets/googleIcon.svg';
import githubIcon from '../../../assets/githubIcon.svg';
import twitterIcon from '../../../assets/twitter1.svg';
import { Link } from 'react-router-dom';
import './login-form.css';

const LoginForm = (props) => {
    const { getFieldDecorator } = props.form;

    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
          if (!err) {
            props.handleSubmit(values.email, values.key);
          }
        });
      };

    return (
        <Row className="login-content">
            <Col lg={{ span:16, offset:4 }} >
                <h2 className="title">Login</h2>
                <Col xs={{ span:5, offset:5 }} style={{ marginBottom:"5%" }}>
                    <img src={googleIcon} width="48px" height="48px" onClick={props.google} />
                </Col>
                <Col xs={{ span:5 }}>
                    <img src={githubIcon} width="48px" height="48px" onClick={props.github} />
                </Col>
                <Col xs={{ span:5 }}>
                    <img src={twitterIcon} width="48px" height="48px" onClick={props.twitter} />
                </Col>
                <Divider className="divider">OR</Divider><br/>
                <Form>
                    <Form.Item>
                        {getFieldDecorator('email', { 
                            rules: [{ required: true, message:"Please enter your email" }] } 
                        )(<Input placeholder="Email" />)}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('key', { 
                            rules: [{ required: true, message:"Please enter your password" }] } 
                        )(<Input.Password placeholder="Password" />)}
                    </Form.Item>
                    <Button type="primary" className="login-btn" onClick={handleSubmit}>Login</Button>
                </Form>
                <p style={{ marginBottom:"13%" }}>No credit card required</p>
                <Link to="/mission-control/signup">Don’t have an account? Signup</Link>
            </Col>
        </Row> 
    );
}

const WrappedLoginForm = Form.create({})(LoginForm);

export default WrappedLoginForm;