import React from "react"
import { Modal, Input, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

const EnableDBForm = ({ handleSubmit, handleCancel, initialValues }) => {
  const [form] = Form.useForm();
  const { conn } = initialValues ? initialValues : {}

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      handleSubmit(values.conn).then(() => handleCancel())
    });
  };

  return (
    <Modal
      title="Enable database"
      okText="Save"
      visible={true}
      onCancel={handleCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" form={form} initialValues={{ conn: conn }} onFinish={handleSubmitClick}>
        <FormItemLabel name="Connection string" />
        <Form.Item name="conn" 
        rules={[{ required: true, message: 'Please provide a connection string!' }]}>
            <Input.Password placeholder="Enter connection string of your database" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EnableDBForm;