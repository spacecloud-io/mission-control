import React from 'react'
import { Form, Input, Button } from 'antd';

const GraphqlTimeout = ({ form, timeout, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.timeout);
      }
    });
  }
  return (
    <div>
      <p>This key is used by the authorization module in Space Cloud to encrypt security rules</p>
      <Form>
        <Form.Item>
          {getFieldDecorator('timeout', {
            rules: [{ required: true, message: 'Please input a time in seconds!' }],
            initialValue: timeout
          })(
            <Input placeholder="Enter time in seconds" />
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

export default Form.create({})(GraphqlTimeout);