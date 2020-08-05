import React from 'react';
import { Button, Input, Form, Card } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { useEffect } from 'react';

const ApplyLicenseForm = ({ clusterName, handleSubmit }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({ clusterName })
  }, [clusterName])

  const handleSubmitClick = ({ clusterName, licenseKey, licenseValue }) => handleSubmit(clusterName, licenseKey, licenseValue)
  return (
    <Card>
      <Form
        form={form}
        onFinish={handleSubmitClick}
        initialValues={{ clusterName }}
      >
        <FormItemLabel name="Provide cluster name" description="Cluster name is used for you to identify the cluster associated with a license key" />
        <Form.Item name="clusterName">
          <Input placeholder="Cluster name" />
        </Form.Item>
        <FormItemLabel name="License key details" />
        <Form.Item name="licenseKey">
          <Input placeholder="License key" addonBefore="Key" />
        </Form.Item>
        <Form.Item name="licenseValue">
          <Input.Password placeholder="License key secret" addonBefore="Secret" />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' size="large" block >Apply license key</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ApplyLicenseForm;
