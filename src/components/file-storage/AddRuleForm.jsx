import React, { useState } from "react"
import { Modal, Input, Form } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
import { notify, isJson } from "../../utils";
import { defaultFileRule } from "../../constants";
import JSONCodeMirror from "../json-code-mirror/JSONCodeMirror";

const AddRuleForm = (props) => {
  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then(values => {
      try {
        props.handleSubmit(values.name, values.prefix, JSON.parse(values.rules))
          .then(() => {
            props.handleCancel();
            form.resetFields();
          })
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    });
  }

  return (
    <Modal
      className="add-filestore-rule-modal"
      title="Add rule"
      visible={true}
      okText="Add"
      width={720}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form} initialValues={{ rules: JSON.stringify(defaultFileRule, null, 2) }} onFinish={handleSubmit} >
        <FormItemLabel name="Name" />
        <Form.Item name="name" rules={[{ required: true, message: 'Please provide a name to your rule!' }]}>
          <Input placeholder="Example: profile-files" />
        </Form.Item>
        <FormItemLabel name="Prefix" />
        <Form.Item name="prefix" rules={[{ required: true, message: 'Please enter prefix!' }]}>
          <Input placeholder="File path prefix. Example: /posts" />
        </Form.Item>
        <FormItemLabel name="Rule" />
        <Form.Item name="rules" rules={[{ required: true }, {
          validateTrigger: "onBlur",
          validator: (_, value, cb) => {
            if (value && !isJson(value)) {
              cb("Please provide a valid JSON object!")
              return
            }
            cb()
          }
        }]}>
          <JSONCodeMirror />
        </Form.Item>
      </Form>
    </Modal>
  );
}


export default AddRuleForm;
