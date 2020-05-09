import React from "react";
import { Modal, Input, Form } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";

const UpdateRootPathModal = ({ rootPath, handleCancel, handleSubmit }) => {
  const [form] = Form.useForm();
  const formInitialValues = { rootPath }

  const handleOk = () => {
    form.validateFields().then(values => {
      handleSubmit(values.rootPath).then(() => {
        handleCancel();
        form.resetFields();
      })
    });
  };

  return (
    <Modal
      title="Update file root path"
      okText="Save"
      visible={true}
      onCancel={handleCancel}
      onOk={handleOk}
      width="600px"
    >
      <Form form={form} initialValues={formInitialValues}>
        <FormItemLabel name="Root path" />
        <Form.Item name="rootPath">
          <Input placeholder="Root path to mount the secret at (eg: /home/.aws)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UpdateRootPathModal;