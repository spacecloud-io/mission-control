import React from 'react'
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';
import { generateAESKey } from "../../utils";

const AESConfigure = ({ form, aesKey, handleSubmit }) => {
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.aesKey);
      }
    });
  }

  const handleClickGenerateKey = () => {
    const newAESKey = generateAESKey()
    setFieldsValue({ aesKey: newAESKey })
  }

  const currentAESKey = getFieldValue("aesKey")
  const isKeyChanged = currentAESKey !== undefined && aesKey !== currentAESKey

  return (
    <div>
      <h2>AES Key</h2>
      <p>This key is used by the security rules in Space Cloud to encrypt/decrypt certain fields</p>
      <Form>
        <div style={{ display: "flex" }}>
          <Form.Item style={{ flex: 1 }}>
            {getFieldDecorator('aesKey', {
              rules: [{ required: true, message: 'Please input a AES Key!' }],
              initialValue: aesKey
            })(
              <Input.Password placeholder="Enter AES Key" />
            )}
          </Form.Item>
          <Form.Item>
            <Button onClick={handleClickGenerateKey} >
              Generate new AES Key
          </Button>
          </Form.Item>
        </div>
        <Form.Item>
          <Button disabled={!isKeyChanged} onClick={handleSubmitClick} >
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Form.create({})(AESConfigure);