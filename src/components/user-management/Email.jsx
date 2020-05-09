import React from 'react'
import { Switch, Button, Form } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const Email = ({ initialValues, handleSubmit }) => {
  const [form] = Form.useForm();
  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      handleSubmit({ enabled: values.enabled });
    });
  };

  return (
    <Form form={form} initialValues={{ enabled: initialValues.enabled }}>
      <FormItemLabel name={"Enabled"} />
      <Form.Item name="enabled" valuePropName="checked">
        <Switch defaultChecked={initialValues.enabled} />
      </Form.Item>
      <br />
      <Form.Item>
        <Button onClick={handleSubmitClick}>Save</Button>
      </Form.Item>
    </Form>
  )
}

export default Email;
