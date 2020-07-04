import React, { useState } from "react"

import { Controlled as CodeMirror } from 'react-codemirror2';
import { Modal, Input, Form } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify } from "../../utils";
import { defaultFileRootPathRule } from "../../constants";

const defaultRule = JSON.stringify(defaultFileRootPathRule, null, 2)
const AddRuleForm = (props) => {
  const [form] = Form.useForm()
  const [data, setData] = useState(defaultRule)

  const handleSubmit = e => {
    form.validateFields().then(values => {
      try {
        props.handleSubmit(values.name, values.prefix, JSON.parse(data));
        props.handleCancel();
        form.resetFields();
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    });
  }

  return (
    <Modal
      title="Add rule"
      visible={true}
      okText="Add"
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{prefix: "/"}}>
        <FormItemLabel name="Name" />
        <Form.Item name="name" rules={[{ required: true, message: 'Please provide a name to your rule!' }]}>
          <Input placeholder="Example: profile-files" />
        </Form.Item>
        <FormItemLabel name="Prefix" />
        <Form.Item name="prefix">
          <Input />
        </Form.Item>
        <FormItemLabel name="Rule" />
        <CodeMirror
          value={data}
          options={{
            mode: { name: "javascript", json: true },
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            tabSize: 2,
            autofocus: true
          }}
          onBeforeChange={(editor, data, value) => {
            setData(value)
          }}
        />
      </Form>
    </Modal>
  );
}


export default AddRuleForm;
