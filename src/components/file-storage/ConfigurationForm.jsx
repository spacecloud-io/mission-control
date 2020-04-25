import React from "react"
import { Modal, Input, Radio, Form } from 'antd';
import RadioCard from "../radio-card/RadioCard"
import FormItemLabel from "../form-item-label/FormItemLabel"


const ConfigurationForm = (props) => {
  const [form] = Form.useForm();

  const handleSubmit = e => {
    form.validateFields().then(values => {
      props.handleSubmit(values);
      props.handleCancel();
      form.resetFields();
    })
  }

  const { storeType, bucket, endpoint, conn } = props.initialValues ? props.initialValues : {}
  return (
    <Modal
      title="Configure File Storage"
      okText="Save"
      visible={true}
      onCancel={form.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} 
      initialValues={{'storeType': storeType ? storeType : "local", 'conn': conn, 'bucket': bucket, "endpoint": endpoint}}>
        <FormItemLabel name="Choose storage backend" />
        <Form.Item name="storeType" rules={[{ required: true, message: 'Please select a storage backend!' }]}>            
            <Radio.Group>
              <RadioCard value="local">Local</RadioCard>
              <RadioCard value="amazon-s3">Amazon S3</RadioCard>
              <RadioCard value="gcp-storage">GCP Storage</RadioCard>
            </Radio.Group>
        </Form.Item>
        {(form.getFieldValue("storeType") === "local" || !form.getFieldValue("storeType")) && <React.Fragment>
          <FormItemLabel name="Directory path" />
          <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a directory path!' }]}>
              <Input placeholder="Example: /home/user/my-folder" />
          </Form.Item>
        </React.Fragment>}
        {form.getFieldValue("storeType") === "amazon-s3" && <React.Fragment>
          <FormItemLabel name="Region" />
          <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a region!' }]}>
              <Input placeholder="Example: us-east-1" />
          </Form.Item>
          <FormItemLabel name="Bucket" />
          <Form.Item name="bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
              <Input placeholder="Example: my-bucket" />
          </Form.Item>
          <FormItemLabel name="Endpoint" description="Optional" />
          <Form.Item name="endpoint">
              <Input placeholder="Example: https://nyc3.digitaloceanspaces.com" />
          </Form.Item>
        </React.Fragment>}
        {form.getFieldValue("storeType") === "gcp-storage" && <React.Fragment>
          <FormItemLabel name="Bucket" />
          <Form.Item name="bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>                  
              <Input placeholder="Example: my-bucket" />
          </Form.Item>
        </React.Fragment>}
      </Form>
    </Modal>
  );
}

export default ConfigurationForm

