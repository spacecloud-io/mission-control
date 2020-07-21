import React from "react";
import { Modal, Input, Form } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";

const getModalTitle = (initialValue, secretType) => {
  return `${initialValue ? "Update" : "Add"} ${
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
        form.resetFields();
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
      <Form form={form} initialValues={{ key: initialValue }}>
        <FormItemLabel name="Key" />
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
            <FormItemLabel name="Value" />
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
            <FormItemLabel name="Value" />
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
