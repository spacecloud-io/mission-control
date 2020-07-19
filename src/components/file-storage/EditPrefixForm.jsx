import React from "react"
import { Modal, Input, Form } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const EditPrefixForm = (props) => {
  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then(values => {
      props.handleSubmit(values.prefix).then(() => {
        props.handleCancel()
      })
    });
  }

  return (
    <Modal
      title="Edit prefix"
      visible={true}
      okText="Save"
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ prefix: props.prefix }} >
        <FormItemLabel name="Prefix" />
        <Form.Item name="prefix" rules={[{ required: true, message: 'Please enter prefix!' }]}>
          <Input placeholder="File path prefix. Example: /posts" />
        </Form.Item>
      </Form>
    </Modal>
  );
}


export default EditPrefixForm;
