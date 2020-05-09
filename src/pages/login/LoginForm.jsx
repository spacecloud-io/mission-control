import React from 'react'
import { Input, Button, Form } from 'antd';
import './login.css'

function LoginForm(props) {
  const [form] = Form.useForm();
  const handleSubmit = e => {
    form.validateFields().then(values => {
      props.handleSubmit(values.userName, values.key);
    })
  };

  return (
    <div className="login-form">
      <p className="sign-in">Sign In</p>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="userName" rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input placeholder="Username" className="input" />
        </Form.Item>
        <Form.Item name="key" rules={[{ required: true, message: 'Please input your key!' }]}>
            <Input.Password type="password" placeholder="Key" className="input" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={props.isLoading} className="btn">
          SIGN IN
          </Button>
      </Form>
    </div>
  )
}

export default LoginForm
