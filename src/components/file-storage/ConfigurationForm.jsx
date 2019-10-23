import React from "react"

import { Modal, Form, Input, Radio } from 'antd';
import RadioCard from "../radio-card/RadioCard"
import FormItemLabel from "../form-item-label/FormItemLabel"

const ConfigurationForm = (props) => {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(values.name, values.type, values.url, values.retries, values.timeout, values.options);
        props.handleCancel();
        props.form.resetFields();
      }
    });
  }
  const { getFieldDecorator, getFieldValue } = props.form;
  const { storeType = "local", conn, bucket, endpoint } = props.initialValues ? props.initialValues : {}
  const storeTypeValue = getFieldValue("storeType")
  return (
    <Modal
      className="edit-item-modal"
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
            initialValue: storeType
          })(
            <Radio.Group>
              <RadioCard value="local">Local</RadioCard>
              <RadioCard value="amazon-s3">Amazon S3</RadioCard>
              <RadioCard value="gcp-storage">GCP Storage</RadioCard>
            </Radio.Group>
          )}
        </Form.Item>
        {storeTypeValue === "local" && <React.Fragment>
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
        {storeTypeValue === "amazon-s3" && <React.Fragment>
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
            {getFieldDecorator('ednpoint', {
              initialValue: endpoint
            })(
              <Input placeholder="Example: https://nyc3.digitaloceanspaces.com" />
            )}
          </Form.Item>
        </React.Fragment>}
        {storeTypeValue === "gcp-storage" && <React.Fragment>
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

