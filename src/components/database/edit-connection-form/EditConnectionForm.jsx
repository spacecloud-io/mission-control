import React from "react"

import { Modal, Form, Input, Alert } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";

const EditConnectionForm = ({ form, handleSubmit, handleCancel, initialValues, conformLoading }) => {
  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.conn)
      }
    });
  }
  const { getFieldDecorator } = form;
  const { conn } = initialValues ? initialValues : {}

  const alertMsg = <div>
    <b>Note:</b> If your database is running inside a docker container, use the container IP address of that docker container as the host in the connection string.
  </div>

  return (
    <Modal
      title="Edit connection details"
      okText="Save"
      visible={true}
      onCancel={handleCancel}
      confirmLoading={conformLoading}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" onSubmit={handleSubmitClick}>
        <FormItemLabel name="Connection string" />
        <Form.Item>
          {getFieldDecorator("conn", {
            rules: [{ required: true, message: 'Please provide a connection string!' }],
            initialValue: conn,
          })(
            <Input placeholder="Enter connection string of your database" />
          )}
        </Form.Item>
        <Alert message={alertMsg}
            description=" "
            type="info"
            showIcon />
      </Form>
    </Modal>
  );
}

export default Form.create({})(EditConnectionForm);

