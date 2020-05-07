import React from "react";
import { Modal, Input, Form } from "antd";
import "./add-secret.css";

const getModalTitle = (initialValue, secretType) => {
  return `${initialValue ? "Add" : "Update"} ${
    secretType === "env" ? "environment variable" : "file secret"
  }`;
};

const AddSecretKey = props => {
  const [form] = Form.useForm();
  const { initialValue, secretType } = props;

  const handleSubmit = e => {
    form.validateFields().then(values => {
        props.handleSubmit(values.key, values.value).then(() => {
          props.handleCancel();
          props.form.resetFields();
        })
      });
    };

  return (
    <Modal
      title={getModalTitle(initialValue, secretType)}
      okText={props.initialValue ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      width="600px"
    >
      <Form form={form} initialValues={{ key: initialValue}}>
        <p>Key</p>
        <Form.Item name="key" rules={[
              {
                required: true,
                message: `Please input ${
                  secretType === "env" ? "key" : "file name"
                }`
              }
            ]}>
            <Input
              disabled={initialValue ? true : false}
              style={{
                width: "90%",
                marginRight: "6%",
                float: "left"
              }}
              placeholder={
                secretType === "env"
                  ? "Key"
                  : "File name (eg: credentials.json)"
              }
            />
        </Form.Item>
        {secretType === "env" && (
          <React.Fragment>
            <p>Value</p>
            <Form.Item name="value" rules={[{ required: true, message: "Please input value" }]}>
                <Input
                  placeholder="Value"
                  style={{ width: "90%", marginRight: "6%", float: "left" }}
                />
            </Form.Item>
          </React.Fragment>
        )}
        {secretType === "file" && (
          <React.Fragment>
            <p>Value</p>
            <Form.Item name="value" rules={[{ required: true, message: "Please input value" }]}>
                <Input.TextArea
                  placeholder="Value"
                  style={{ width: "90%", marginRight: "6%", float: "left" }}
                />
            </Form.Item>
          </React.Fragment>
        )}
      </Form>
    </Modal>
  );
};

export default AddSecretKey;
