import React from "react"

import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';

import { Modal, Input, Radio } from 'antd';
import RadioCard from "../radio-card/RadioCard"
import FormItemLabel from "../form-item-label/FormItemLabel"

const ConfigurationForm = (props) => {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(values);
        props.handleCancel();
        props.form.resetFields();
      }
    });
  }
  const { getFieldDecorator, getFieldValue } = props.form;
  const { storeType, bucket, endpoint, conn } = props.initialValues ? props.initialValues : {}
  return (
    <Modal
      title="Configure File Storage"
      okText="Save"
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Choose storage backend" />
        <Form.Item>
          {getFieldDecorator('storeType', {
            rules: [{ required: true, message: 'Please select a storage backend!' }],
            initialValue: storeType ? storeType : "local"
          })(
            <Radio.Group>
              <RadioCard value="local">Local</RadioCard>
              <RadioCard value="amazon-s3">Amazon S3</RadioCard>
              <RadioCard value="gcp-storage">GCP Storage</RadioCard>
            </Radio.Group>
          )}
        </Form.Item>
        {(getFieldValue("storeType") === "local" || !getFieldValue("storeType")) && <React.Fragment>
          <FormItemLabel name="Directory path" />
          <Form.Item>
            {getFieldDecorator('conn', {
              rules: [{ required: true, message: 'Please provide a directory path!' }],
              initialValue: conn
            })(
              <Input placeholder="Example: /home/user/my-folder" />
            )}
          </Form.Item>
        </React.Fragment>}
        {getFieldValue("storeType") === "amazon-s3" && <React.Fragment>
          <FormItemLabel name="Region" />
          <Form.Item>
            {getFieldDecorator('conn', {
              rules: [{ required: true, message: 'Please provide a region!' }],
              initialValue: conn
            })(
              <Input placeholder="Example: us-east-1" />
            )}
          </Form.Item>
          <FormItemLabel name="Bucket" />
          <Form.Item>
            {getFieldDecorator('bucket', {
              rules: [{ required: true, message: 'Please provide a bucket!' }],
              initialValue: bucket
            })(
              <Input placeholder="Example: my-bucket" />
            )}
          </Form.Item>
          <FormItemLabel name="Endpoint" description="Optional" />
          <Form.Item>
            {getFieldDecorator('endpoint', {
              initialValue: endpoint
            })(
              <Input placeholder="Example: https://nyc3.digitaloceanspaces.com" />
            )}
          </Form.Item>
        </React.Fragment>}
        {getFieldValue("storeType") === "gcp-storage" && <React.Fragment>
          <FormItemLabel name="Bucket" />
          <Form.Item>
            {getFieldDecorator('bucket', {
              rules: [{ required: true, message: 'Please provide a bucket!' }],
              initialValue: bucket
            })(
              <Input placeholder="Example: my-bucket" />
            )}
          </Form.Item>
        </React.Fragment>}
      </Form>
    </Modal>
  );
}

const WrappedConfigurationForm = Form.create({})(ConfigurationForm);

export default WrappedConfigurationForm

