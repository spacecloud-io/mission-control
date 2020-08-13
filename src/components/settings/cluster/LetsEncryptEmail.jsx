import React from "react";
import { Form, Input, Button } from 'antd';

const LetsEncryptEmail = ({ loading, letsEncryptEmail, handleSubmit }) => {
  const [form] = Form.useForm();
  if (!loading) {
    form.setFieldsValue({ letsEncryptEmail })
  }

  const handleSubmitClick = values => handleSubmit(values.letsEncryptEmail);

  return(
    <React.Fragment>
    <h2>LetsEncrypt Email</h2>
    <p>The admin email address for letsencrypt certificates</p>
    <Form form={form} initialValues={{ letsEncryptEmail }} onFinish={handleSubmitClick}>
      <Form.Item name="letsEncryptEmail"
        rules={[{ required: true, message: 'Please input your email address!' }]}
      >
        <Input placeholder="Enter your email address" />
      </Form.Item>
      <Form.Item shouldUpdate={(prev, curr) => prev.letsEncryptEmail !== curr.letsEncryptEmail}>
        {
          () => {
            const valueChanged = letsEncryptEmail !== undefined && form.getFieldValue("letsEncryptEmail") != letsEncryptEmail
            return (
              <Button disabled={!valueChanged} htmlType="submit" >
                Save
              </Button>
            )
          }
        }
      </Form.Item>
    </Form>
    </React.Fragment>
  );
} 

export default LetsEncryptEmail;