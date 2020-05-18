import React from "react"
import { Modal, Input, Alert, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";

const EditConnectionForm = ({ handleSubmit, handleCancel, initialValues, conformLoading }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => handleSubmit(values.conn))
  }

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
      onOk={handleOk}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <FormItemLabel name="Connection string" />
        <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a connection string!' }]}>
          <Input.Password placeholder="Enter connection string of your database" />
        </Form.Item>
        <Alert message={alertMsg}
          description=" "
          type="info"
          showIcon />
      </Form>
    </Modal>
  );
}

export default EditConnectionForm;

