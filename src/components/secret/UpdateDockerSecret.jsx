import React from "react";
import { Modal, Form, Input } from "antd";
import "./add-secret.css";

const UpdateDockerSecret = props => {
  const { getFieldDecorator } = props.form;
  const { initialValue } = props;

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props
          .handleSubmit(Object.assign({}, values, { type: "docker" }))
          .then(() => {
            props.handleCancel();
            props.form.resetFields();
          });
      }
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
      <Form>
        <p>Secret name</p>
        <Form.Item>
          {getFieldDecorator(`id`, {
            initialValue: initialValue
          })(<Input disabled={true} />)}
        </Form.Item>
        <p>Docker Username</p>
        <Form.Item>
          {getFieldDecorator(`data.username`, {
            rules: [
              {
                required: true,
                message: `Please input your docker username`
              }
            ]
          })(<Input placeholder="Username of your docker registry" />)}
        </Form.Item>
        <p>Docker Password</p>
        <Form.Item>
          {getFieldDecorator(`data.password`, {
            rules: [
              {
                required: true,
                message: `Please input your docker password`
              }
            ]
          })(<Input.Password type="password" placeholder="Password of your docker registry" />)}
        </Form.Item>
        <p>Docker Registry URL</p>
        <Form.Item>
          {getFieldDecorator(`data.url`, {
            rules: [
              {
                required: true,
                message: `Please input your docker registry url`
              }
            ]
          })(<Input placeholder="Example: https://index.docker.io/v1/" />)}
        </Form.Item>
      </Form>
    </Modal>
  );
};

const WrappedRuleForm = Form.create({})(UpdateDockerSecret);

export default WrappedRuleForm;
