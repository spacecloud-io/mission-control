import React from 'react'
import { Form, Input, Button } from 'antd';

const AESConfigure = ({ form, aesKey, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.aesKey);
      }
    });
  }
  return (
    <div>
      <p>This key is used by the security rules in Space Cloud to encrypt/decrypt certain fields</p>
      <Form>
        <Form.Item>
          {getFieldDecorator('aesKey', {
            rules: [{ required: true, message: 'Please input a AES Key!' }],
            initialValue: aesKey
          })(
            <Input.Password placeholder="Enter AES Key" />
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

export default Form.create({})(AESConfigure);