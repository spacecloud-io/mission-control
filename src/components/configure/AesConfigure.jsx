import React from 'react'
import { Form, Input, Button } from 'antd';

const AesConfigure = ({ form, aes, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.aes);
      }
    });
  }
  return (
    <div>
      <p>This key is used by the authorization module in Space Cloud to encrypt security rules</p>
      <Form>
        <Form.Item>
          {getFieldDecorator('aes', {
            rules: [{ required: true, message: 'Please input a AES Key!' }],
            initialValue: aes
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

export default Form.create({})(AesConfigure);