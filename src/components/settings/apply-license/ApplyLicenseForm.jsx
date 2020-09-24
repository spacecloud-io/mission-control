import React from 'react';
import { Button, Input, Form, Card } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { useEffect } from 'react';

const ApplyLicenseForm = ({ clusterName, handleSubmit, handleSubmitOfflineLicense, licenseMode }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({ clusterName })
  }, [clusterName])

  const handleSubmitClick = ({ clusterName, licenseKey, licenseValue }) => handleSubmit(clusterName, licenseKey, licenseValue)
  const handleOfflineLicenseClick = ({licenseKey}) => handleSubmitOfflineLicense(licenseKey)
  return (
    <Card>
      <Form
        form={form}
        onFinish={licenseMode === 'offline' ? handleOfflineLicenseClick : handleSubmitClick}
        initialValues={{ clusterName }}
      >
        {licenseMode !== 'offline' && <React.Fragment>
          <FormItemLabel name="Provide cluster name" description="Cluster name is used for you to identify the cluster associated with a license key" />
          <Form.Item name="clusterName" rules={[{ required: true, message: "Please provide a cluster name!" }]}>
            <Input placeholder="Cluster name" />
          </Form.Item>
          <FormItemLabel name="License key details" />
          <Form.Item name="licenseKey" rules={[{ required: true, message: "Please provide a license key!" }]}>
            <Input placeholder="License key" addonBefore="Key" />
          </Form.Item>
          <Form.Item name="licenseValue" rules={[{ required: true, message: "Please provide a license key secret!" }]}>
            <Input.Password placeholder="License key secret" addonBefore="Secret" />
          </Form.Item>
        </React.Fragment> }
        {licenseMode === 'offline' && <React.Fragment>
          <FormItemLabel name='License file'/>
          <Form.Item name='licenseKey' rules={[{ required: true, message: "Please provide a license key!" }]}>
            <Input.TextArea rows={3} placeholder='Paste your license file contents over here' />
          </Form.Item>  
        </React.Fragment>}
        <Form.Item>
          <Button type='primary' htmlType='submit' size="large" block >Apply license key</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ApplyLicenseForm;
