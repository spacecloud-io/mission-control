import React, { useState } from "react"
import { Modal, Input, Select, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify } from "../../../utils";
import { defaultEndpointRule } from "../../../constants"

const { Option } = Select;


const EndpointForm = (props) => {
  const [form] = Form.useForm();

  const handleSubmit = e => {
    form.validateFields().then(values => {
      try {
        props.handleSubmit(values.name, values.method, values.path, JSON.parse(data));
        props.handleCancel();
        form.resetFields();
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    });
  }

  const { name, path, method, rule } = props.initialValues ? props.initialValues : {}
  const initialRule = rule ? rule : defaultEndpointRule
  const [data, setData] = useState(JSON.stringify(initialRule, null, 2))
  return (
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Endpoint`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      width="720px"
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} 
      initialValues={{ 'name': name, 'method': method ? method : "POST", 'path': path }}>
        <FormItemLabel name="Endpoint name" />
        <Form.Item name="name" rules={[
          {
            validator: (_, value, cb) => {
              if (!value) {
                cb("Please provide a endpoint name!")
                return
              }
              if (!(/^[0-9a-zA-Z_]+$/.test(value))) {
                cb("Endpoint name can only contain alphanumeric characters and underscores!")
                return
              }
              cb()
            }
          }
        ]}>
            <Input placeholder="Example: allPayments" disabled={props.initialValues ? true : false} />
        </Form.Item>
        <FormItemLabel name="Method" />
        <Form.Item name="method" rules={[{ required: true, message: 'Please select a method!' }]}>
            <Select placeholder="Please select a method">
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="GET">GET</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
        </Form.Item>
        <FormItemLabel name="Path" />
        <Form.Item name="path" rules={[{ required: true, message: 'Please provide path!' }]}>
            <Input addonBefore={props.url} placeholder="Example: /v1/payments" />
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

export default EndpointForm

