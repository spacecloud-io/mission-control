import React from "react"

import { Modal, Form, Input } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

const EditConnectionForm = (props) => {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(values.conn);
        props.handleCancel();
        props.form.resetFields();
      }
    });
  }
  const { getFieldDecorator } = props.form;
  const { conn } = props.initialValues ? props.initialValues : {}
  return (
    <Modal
      className="edit-item-modal"
      title="Edit connection details"
      okText="Save"
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Connection string" />
        <Form.Item>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please provide a connection string!' }],
            initialValue: conn
          })(
            <Input placeholder="Enter connection string of your database" />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}

const WrappedEditConnectionForm = Form.create({})(EditConnectionForm);

export default WrappedEditConnectionForm

