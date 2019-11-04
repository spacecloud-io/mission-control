import React from 'react'
import { Form, Input, Button } from 'antd';

const SecretConfigure = ({ form, secret, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.secret);
      }
    });
  }
  return (
    <div>
      <p>This secret is used by the authorization module in Space Cloud to verify the JWT token for all API requests</p>
      <Form>
        <Form.Item>
          {getFieldDecorator('secret', {
            rules: [{ required: true, message: 'Please input a secret!' }],
            initialValue: secret
          })(
            <Input.Password placeholder="Enter JWT Secret" />
          )}
        </Form.Item>
        <Form.Item>
          <Button onClick={handleSubmitClick} >
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Form.create({})(SecretConfigure);