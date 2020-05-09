import React from "react";
import { Modal, Input, Form } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";

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
        <Form.Item name="id">
          <Input disabled={true} />
        </Form.Item>
        <FormItemLabel name="Docker Username" />
        <Form.Item name={["data", "username"]} rules={[
          {
            required: true,
            message: `Please input your docker username`
          }
        ]}>
          <Input placeholder="Username of your docker registry" />
        </Form.Item>
        <FormItemLabel name="Docker Password" />
        <Form.Item name={["data", "password"]} rules={[
          {
            required: true,
            message: `Please input your docker password`
          }
        ]}>
          <Input.Password type="password" placeholder="Password of your docker registry" />
        </Form.Item>
        <FormItemLabel name="Docker Registry URL" />
        <Form.Item name={["data", "url"]} rules={[
          {
            required: true,
            message: `Please input your docker registry url`
          }
        ]}>
          <Input placeholder="Example: https://index.docker.io/v1/" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateDockerSecret;
