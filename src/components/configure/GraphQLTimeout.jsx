import React from 'react'
import { Form, Input, Button } from 'antd';

const GraphQLTimeout = ({ form, contextTime, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(Number(values.contextTime));
      }
    });
  }
  return (
    <div>
      <p>The timeout of GraphQL requests in seconds</p>
      <Form>
        <Form.Item>
          {getFieldDecorator('contextTime', {
            rules: [{ required: true, message: 'Please input a time in seconds!' }],
            initialValue: contextTime
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