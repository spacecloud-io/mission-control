import React from 'react'
import { Form, Input, Button } from 'antd';
import './sign-up.css'

function SignUpForm(props) {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(values.email, values.userName, values.password);
      }
    });
  };
  const { getFieldDecorator } = props.form;

  return (
    <div className="sign-up-form">
      <p className="sign-in">Sign Up</p>
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {getFieldDecorator('email', {
            rules: [
              {type: 'email',message: 'The input is not valid E-mail!'}
            ]})(<Input placeholder="Email"/>)}
        </Form.Item>

        <Form.Item >
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input placeholder="Username" className="input" />,
          )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your password!' }],
          })(
            <Input.Password type="password" placeholder="Password" className="input" />
          )}
        </Form.Item>

        <Form.Item hasFeedback>
          {getFieldDecorator('confirm', {
            rules: [
              {required: true,message: 'Please confirm your password!'}],
          })(<Input.Password type="password" className="input" placeholder="Re-type Password"/>)}
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={props.isLoading} className="btn">
          SIGN UP
          </Button>
      </Form>
    </div>
  )
}

const WrappedSignUpForm = Form.create({})(SignUpForm);

export default WrappedSignUpForm
