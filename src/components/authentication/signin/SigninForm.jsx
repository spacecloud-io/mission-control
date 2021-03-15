import React from 'react';
import { Row, Col, Form, Input, Button, Divider } from 'antd';
import googleIcon from '../../../assets/googleIcon.svg';
import githubIcon from '../../../assets/githubIcon.svg';
import twitterIcon from '../../../assets/twitter1.svg';
import { Link } from 'react-router-dom';
import './signin-form.css';

const SigninForm = ({ handleSubmit, google, github, twitter }) => {
    
  const [form] = Form.useForm();
  const handleSubmitClick = () => {
    form.validateFields().then(values => {
      handleSubmit(values.name, values.email, values.password);
    });
  };

    return (
      <Row className="signin-content">
        <Col xs={{ span: 18, offset: 3 }} lg={{ span:16, offset:4 }} >
          <h2 className="title">Login</h2>
            <div style={{ display: "flex", justifyContent: "space-evenly"}}>
            <img src={googleIcon} width="48px" height="48px" onClick={google} />
            <img src={githubIcon} width="48px" height="48px" onClick={github} />
            <img src={twitterIcon} width="48px" height="48px" onClick={twitter} />
          </div>
          <Divider className="divider">OR</Divider>
          <Form form={form} onFinish={handleSubmitClick}>
            <Form.Item name='email' rules={[{ type: 'email', required: true, message: "Please enter your valid email" }]}>
              <Input placeholder="Email" type='email' />
            </Form.Item>
            <Form.Item name='password' rules={[{ required: true, message: "Please enter your password" }]}>
                <Input.Password placeholder="Password" type='password' />
            </Form.Item>
            <Button type="primary" className="signin-btn" onClick={handleSubmitClick}>Login</Button>
          </Form>
          <Link style={{ marginTop:"64px", marginBottom: '96px' }} to="/mission-control/signup">Don't have an account? Signup</Link>
        </Col>
      </Row> 
    );
}

export default SigninForm;