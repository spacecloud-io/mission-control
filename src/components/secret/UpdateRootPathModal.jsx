import React from "react";
import { Modal, Input, Form } from "antd";
import "./add-secret.css";

const UpdateRootPathModal = (props) => {
  const [form] = Form.useForm();
  const { rootPath } = props;

  const handleSubmit = e => {
    form.validateFields().then(values => {
      props.handleSubmit(values.rootPath).then(() => {
        props.handleCancel();
        props.form.resetFields();
      })
    });
  };

  return (
    <Modal
      title="Update file root path"
      okText="Save"
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      width="600px"
    >
      <Form form={form} initialValues={{ rootPath: rootPath }}>
        <p>Root path</p>
        {/* {getFieldDecorator("rootPath", {
          rules: [
            {
              required: true,
              message: "Please input a root path"
            }
          ]
        })( */}
          <Input placeholder="Root path to mount the secret at (eg: /home/.aws)" />
        {/* )} */}
      </Form>
    </Modal>
  );
}

export default UpdateRootPathModal;