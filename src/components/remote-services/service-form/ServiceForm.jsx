import React from "react"

import { Modal, Form, Input } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

const ServiceForm = (props) => {
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
  const { name, url } = props.initialValues ? props.initialValues : {}
  return (
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Remote Service`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Service name" />
        <Form.Item>
          {getFieldDecorator('name', {
            rules: [
              {
                validator: (_, value, cb) => {
                  if (!value) {
                    cb("Please provide a service name!")
                    return
                  }
                  if (!(/^[0-9a-zA-Z]+$/.test(value))) {
                    cb("Service name can only contain alphanumeric characters!")
                    return
                  }
                  cb()
                }
              }
            ],
            initialValue: name
          })(
            <Input placeholder="Example: payment_service" disabled={props.initialValues ? true : false} />
          )}
        </Form.Item>
        <FormItemLabel name="URL" />
        <Form.Item>
          {getFieldDecorator('url', {
            rules: [{ required: true, message: 'Please provide url!' }],
            initialValue: url
          })(
            <Input placeholder="Example: http://localhost:3000" />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default Form.create({ name: "service-form" })(ServiceForm)

