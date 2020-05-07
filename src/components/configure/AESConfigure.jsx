import React, { useState } from 'react'
import { Input, Button, Form } from 'antd';
import { generateAESKey } from "../../utils";

const AESConfigure = ({ aesKey, handleSubmit }) => {
  const [form] = Form.useForm();  
  const [currentAESKey, setCurrentAESKey] = useState();

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      handleSubmit(values.aesKey);
    });
  };

  const handleChangedValues = ({ aesKey }) => {
    setCurrentAESKey(aesKey);
  }


  const handleClickGenerateKey = () => {
    const newAESKey = generateAESKey()
    form.setFieldsValue({ aesKey: newAESKey })
  }

  const isKeyChanged = currentAESKey !== undefined && aesKey !== currentAESKey

  return (
    <div>
      <h2>AES Key</h2>
      <p>This key is used by the security rules in Space Cloud to encrypt/decrypt certain fields</p>
      <Form form={form} onValuesChange={handleChangedValues} initialValues={{ aesKey: aesKey }}>
        <div style={{ display: "flex" }}>
          <Form.Item name="aesKey" style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please input a AES Key!' }]}
          >
              <Input.Password placeholder="Enter AES Key" />
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

export default AESConfigure;