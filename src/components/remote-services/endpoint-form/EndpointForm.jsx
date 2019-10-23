import React from "react"

import { Modal, Form, Input } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

const EndpointForm = (props) => {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(values.name, values.url);
        props.handleCancel();
        props.form.resetFields();
      }
    });
  }
  const { getFieldDecorator } = props.form;
  const { name, path } = props.initialValues ? props.initialValues : {}
  return (
    <Modal
      className="edit-item-modal"
      title={`${props.initialValues ? "Edit" : "Add"} Endpoint`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Endpoint name" />
        <Form.Item>
          {getFieldDecorator('name', {
            rules: [
              {
                validator: (_, value, cb) => {
                  if (!value) {
                    cb("Please provide a endpoint name!")
                    return
                  }
                  if (value.includes("-") || value.includes(" ")) {
                    cb("Endpoint name cannot contain hiphens or spaces!")
                  }
                }
              }
            ],
            initialValue: name
          })(
            <Input placeholder="Example: allPayments" />
          )}
        </Form.Item>
        <FormItemLabel name="Path" />
        <Form.Item>
          {getFieldDecorator('path', {
            rules: [{ required: true, message: 'Please provide path!' }],
            initialValue: path
          })(
            <Input addonBefore={props.url} placeholder="Example: /v1/payments" />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}

const WrappedEndpointForm = Form.create({})(EndpointForm);

export default WrappedEndpointForm

