import React from "react"

import { Modal, Form, Input } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

const EditConnectionForm = ({form, handleSubmit, handleCancel, initialValues}) => {
  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.conn);
        handleCancel();
        form.resetFields();
      }
    });
  }
  const { getFieldDecorator } = form;
  const { conn } = initialValues ? initialValues : {}
  return (
    <Modal
      className="edit-item-modal"
      title="Edit connection details"
      okText="Save"
      visible={true}
      onCancel={handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmitClick}>
        <FormItemLabel name="Connection string" />
        <Form.Item>
          {getFieldDecorator("conn", {
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

export default Form.create({})(EditConnectionForm);

