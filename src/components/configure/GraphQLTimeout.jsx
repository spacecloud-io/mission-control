import React from 'react'
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';

const GraphQLTimeout = ({ form, contextTimeGraphQL, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(Number(values.contextTimeGraphQL));
      }
    });
  }
  return (
    <div>
      <h2>GraphQL Timeout (in seconds)</h2>
      <p>The timeout of GraphQL requests in seconds</p>
      <Form>
        <Form.Item>
          {getFieldDecorator('contextTimeGraphQL', {
            rules: [{ required: true, message: 'Please input a time in seconds!' }],
            initialValue: contextTimeGraphQL
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