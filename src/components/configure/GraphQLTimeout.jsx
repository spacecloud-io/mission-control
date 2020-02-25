import React from 'react'
import { Form, Input, Button } from 'antd';

const GraphQLTimeout = ({ form, contextTimeout, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.contextTimeout);
      }
    });
  }
  return (
    <div>
      <p>The timeout of GraphQL requests in seconds</p>
      <Form>
        <Form.Item>
          {getFieldDecorator('contextTimeout', {
            rules: [{ required: true, message: 'Please input a time in seconds!' }],
            initialValue: contextTimeout
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

export default Form.create({})(GraphQLTimeout);