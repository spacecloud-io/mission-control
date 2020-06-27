import React from 'react'
import { Form, Input, Button } from 'antd';

const GraphQLTimeout = ({ loading, contextTimeGraphQL = "", handleSubmit }) => {
  const [form] = Form.useForm();
  if (!loading) {
    form.setFieldsValue({ contextTimeGraphQL })
  }

  const handleSubmitClick = values => handleSubmit(Number(values.contextTimeGraphQL));

  return (
    <div>
      <h2>GraphQL Timeout (in seconds)</h2>
      <p>The timeout of GraphQL requests in seconds</p>
      <Form form={form} initialValues={{ contextTimeGraphQL: String(contextTimeGraphQL) }} onFinish={handleSubmitClick}>
        <Form.Item name="contextTimeGraphQL"
          rules={[{ required: true, message: 'Please input a time in seconds!' }]}
        >
          <Input placeholder="Enter time in seconds" />
        </Form.Item>
        <Form.Item shouldUpdate={(prev, curr) => prev.contextTimeGraphQL !== curr.contextTimeGraphQL}>
          {
            () => {
              const valueChanged = form.getFieldValue("contextTimeGraphQL") != contextTimeGraphQL
              return (
                <Button disabled={!valueChanged} htmlType="submit" >
                  Save
                </Button>
              )
            }
          }
        </Form.Item>
      </Form>
    </div>
  )
}

export default GraphQLTimeout;