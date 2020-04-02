import React, { useState } from "react"
import { Modal, Form, Input, Select } from 'antd';
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
  
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        try {
          props.handleSubmit(values.name, values.method, values.path, JSON.parse(data));
          props.handleCancel();
          props.form.resetFields();
        } catch (ex) {
          notify("error", "Error", ex.toString())
        }
      }
    })
  }
  const { getFieldDecorator } = props.form;
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
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Endpoint name" />
        <Form.Item>
          {getFieldDecorator('name', {
            rules: [
              {
                validator: (_, value, cb) => {
                  if (!value) {
                    cb("Please provide a endpoint name!")
                    return
                  }
                  if (value.includes("-") || value.includes(" ")) {
                    cb("Endpoint name cannot contain hiphens or spaces!")
                  }
                  cb()
                }
              }
            ],
            initialValue: name
          })(
            <Input placeholder="Example: allPayments" disabled={props.initialValues ? true : false} />
          )}
        </Form.Item>
        <FormItemLabel name="Method" />
        <Form.Item>
          {getFieldDecorator('method', {
            rules: [{ required: true, message: 'Please select a method!' }],
            initialValue: method ? method : "POST"
          })(
            <Select placeholder="Please select a method">
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="GET">GET</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          )}
        </Form.Item>
        <FormItemLabel name="Path" />
        <Form.Item>
          {getFieldDecorator('path', {
            rules: [{ required: true, message: 'Please provide path!' }],
            initialValue: path
          })(
            <Input addonBefore={props.url} placeholder="Example: /v1/payments" />
          )}
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

const WrappedEndpointForm = Form.create({})(EndpointForm);

export default WrappedEndpointForm

