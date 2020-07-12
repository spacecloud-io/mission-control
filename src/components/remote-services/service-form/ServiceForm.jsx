import React from "react"
import { Modal, Input, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

const ServiceForm = (props) => {
  const [form] = Form.useForm();

  const handleSubmit = e => {
    form.validateFields().then(values => {
      props.handleSubmit(values.name, values.url).then(() => {
        props.handleCancel();
        form.resetFields();
      })
    });
  }

  const { name, url } = props.initialValues ? props.initialValues : {}
  return (
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Remote Service`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ 'name': name, 'url': url }}>
        <FormItemLabel name="Service name" />
        <Form.Item name="name" rules={[
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
        ]}>
          <Input placeholder="Example: payment_service" disabled={props.initialValues ? true : false} />
        </Form.Item>
        <FormItemLabel name="URL" />
        <Form.Item name="url" rules={[{ required: true, message: 'Please provide url!' }]}>
          <Input placeholder="Example: http://localhost:3000" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ServiceForm;

