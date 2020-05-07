import React from "react";
import { Modal, Input, Form } from "antd";
import "./add-secret.css";

const UpdateDockerSecret = props => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      props
        .handleSubmit(Object.assign({}, values, { type: "docker" }))
        .then(() => {
          props.handleCancel();
          form.resetFields();
        });
    });
  };

  return (
    <Modal
      title="Update docker secret"
      okText="Save"
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      width="600px"
    >
      <Form form={form} initialValues={{ "id": props.initialValue }}>
        <p>Secret name</p>
        <Form.Item name="id">
          <Input disabled={true} />
        </Form.Item>
        <p>Docker Username</p>
        <Form.Item name="data.username" rules={[
          {
            required: true,
            message: `Please input your docker username`
          }
        ]}>
          <Input placeholder="Username of your docker registry" />
        </Form.Item>
        <p>Docker Password</p>
        <Form.Item name="data.password" rules={[
          {
            required: true,
            message: `Please input your docker password`
          }
        ]}>
          <Input.Password type="password" placeholder="Password of your docker registry" />
        </Form.Item>
        <p>Docker Registry URL</p>
        <Form.Item name="data.url" rules={[
          {
            required: true,
            message: `Please input your docker registry url`
          }
        ]}>
          <Input placeholder="https://foo.bar.com/my-private-registry" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateDockerSecret;
