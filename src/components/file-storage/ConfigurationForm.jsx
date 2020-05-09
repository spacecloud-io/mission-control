import React from "react"
import { Modal, Input, Radio, Form } from 'antd';
import RadioCards from "../radio-cards/RadioCards"
import FormItemLabel from "../form-item-label/FormItemLabel"
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";

const ConfigurationForm = (props) => {
  const [form] = Form.useForm();

  const handleFinish = () => {
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
      onCancel={props.handleCancel}
      onOk={handleFinish}
    >
      <Form layout="vertical" form={form}
        initialValues={{ 'storeType': storeType ? storeType : "local", 'conn': conn, 'bucket': bucket, "endpoint": endpoint }}>
        <FormItemLabel name="Choose storage backend" />
        <Form.Item name="storeType" rules={[{ required: true, message: 'Please select a storage backend!' }]}>
          <RadioCards>
            <Radio.Button value="local">Local File Store</Radio.Button>
            <Radio.Button value="amazon-s3">Amazon S3</Radio.Button>
            <Radio.Button value="gcp-storage">Google Cloud Storage</Radio.Button>
          </RadioCards>
        </Form.Item>
        <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "local"}>
          <FormItemLabel name="Directory path" />
          <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a directory path!' }]}>
            <Input placeholder="Example: /home/user/my-folder" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "amazon-s3"}>
          <FormItemLabel name="Bucket" />
          <Form.Item name="bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
            <Input placeholder="Example: my-bucket" />
          </Form.Item>
          <FormItemLabel name="Region" />
          <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a region!' }]} shouldUpdate>
            <Input placeholder="Example: us-east-1" />
          </Form.Item>
          <FormItemLabel name="Endpoint" description="Optional" />
          <Form.Item name="endpoint">
            <Input placeholder="Example: https://nyc3.digitaloceanspaces.com" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "gcp-storage"}>
          <FormItemLabel name="Bucket" />
          <Form.Item name="bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
            <Input placeholder="Example: my-bucket" />
          </Form.Item>
        </ConditionalFormBlock>
      </Form>
    </Modal >
  );
}

export default ConfigurationForm

