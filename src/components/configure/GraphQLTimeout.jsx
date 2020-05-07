import React from 'react'
import { Form, Input, Button } from 'antd';

const GraphQLTimeout = ({ contextTimeGraphQL, handleSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      handleSubmit(Number(values.contextTimeGraphQL));
    });
  };

  return (
    <div>
      <h2>GraphQL Timeout (in seconds)</h2>
      <p>The timeout of GraphQL requests in seconds</p>
      <Form form={form} initialValues={{ contextTimeGraphQL: contextTimeGraphQL }}>
        <Form.Item name="contextTimeGraphQL" 
        rules={[{ required: true, message: 'Please input a time in seconds!' }]}
        >
            <Input placeholder="Enter time in seconds" />
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

export default GraphQLTimeout;