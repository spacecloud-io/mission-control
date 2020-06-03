import React from 'react'
import { Input, Button, Form } from 'antd';
import { generateAESKey } from "../../../utils";

const AESConfigure = ({ loading, aesKey, handleSubmit }) => {
  const [form] = Form.useForm();
  const handleClickGenerateKey = () => form.setFieldsValue({ aesKey: generateAESKey() })
  const handleFormSubmit = (values) => handleSubmit(values.aesKey);
  if (!loading) {
    form.setFieldsValue({ aesKey })
  }
  return (
    <div>
      <h2>AES Key</h2>
      <p>This key is used by the security rules in Space Cloud to encrypt/decrypt certain fields</p>
      <Form form={form} initialValues={{ aesKey }} onFinish={handleFormSubmit}>
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
        <Form.Item shouldUpdate={(prev, curr) => prev.aesKey !== curr.aesKey}>
          {
            () => {
              const valueChanged = aesKey !== undefined && form.getFieldValue("aesKey") !== aesKey
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

export default AESConfigure;