import React from 'react';
import { Row, Col, Form, Input, Button, Divider } from 'antd';
import googleIcon from '../../../assets/googleIcon.svg';
import githubIcon from '../../../assets/githubIcon.svg';
import twitterIcon from '../../../assets/twitter1.svg';
import { Link } from 'react-router-dom';
import './signup-form.css';

const SignupForm = ({ handleSubmit, google, github, twitter }) => {
    
  const [form] = Form.useForm();
  const handleSubmitClick = () => {
    form.validateFields().then(values => {
      handleSubmit(values.name, values.email, values.password);
    });
  };

    return (
      <Row className="signup-content">
        <Col xs={{ span: 18, offset: 3 }} lg={{ span:16, offset:4 }} >
          <h2 className="title">Create an account</h2>
            <div style={{ display: "flex", justifyContent: "space-evenly"}}>
            <img src={googleIcon} width="48px" height="48px" onClick={google} />
            <img src={githubIcon} width="48px" height="48px" onClick={github} />
            <img src={twitterIcon} width="48px" height="48px" onClick={twitter} />
          </div>
          <Divider className="divider">OR</Divider>
          <Form form={form} onFinish={handleSubmitClick}>
            <Form.Item name='name' rules={[{ required: true, message: "Please enter your name" }]}>
              <Input placeholder="Name" type='text' />
            </Form.Item>
            <Form.Item name='email' rules={[{ type: 'email', required: true, message: "Please enter your valid email" }]}>
              <Input placeholder="Email" type='email' />
            </Form.Item>
            <Form.Item name='password' rules={[{
              validator: (_, value, cb) => {
                const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
                if (!value) {
                  cb("Please enter your password")
                  return
                }
                if (!regex.test(value)) {
                  cb("Password should be atleast 8 characters long")
                }
                cb()
              }}]}>
                <Input.Password placeholder="Password" type='password' />
            </Form.Item>
            <Button type="primary" className="signup-btn" onClick={handleSubmitClick}>Signup for free</Button>
          </Form>
          <p style={{ marginBottom:"64px", marginTop:"8px" }}>No credit card required</p>
          <Link style={{ marginBottom: '96px' }} to="/mission-control/signin">Already have an account? Login</Link>
        </Col>
      </Row> 
    );
}

export default SignupForm;