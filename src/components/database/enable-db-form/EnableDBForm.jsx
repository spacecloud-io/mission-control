import React, { useState } from "react"
import { Modal, Input, Form } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify } from '../../../utils';

const EnableDBForm = ({ handleSubmit, handleCancel, initialValues }) => {
  const [form] = Form.useForm();
  const { conn, rules } = initialValues ? initialValues : {}

  const [rule, setRule] = useState(JSON.stringify(rules, null, 2));

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      try {
        handleSubmit(
          values.conn,
          JSON.parse(rule)
        );
        handleCancel();
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    });
  };


  return (
    <Modal
      title="Enable database"
      okText="Save"
      visible={true}
      onCancel={handleCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" form={form} initialValues={{ conn: conn }} onFinish={handleSubmitClick}>
        <FormItemLabel name="Connection string" />
        <Form.Item name="conn" 
        rules={[{ required: true, message: 'Please provide a connection string!' }]}>
            <Input placeholder="Enter connection string of your database" />
        </Form.Item>
        <FormItemLabel name="Default rules" />
        <CodeMirror
          value={rule}
          options={{
            mode: { name: "javascript", json: true },
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            tabSize: 2,
            autofocus: false
          }}
          onBeforeChange={(editor, data, value) => {
            setRule(value)
          }}
        />
      </Form>
    </Modal>
  );
}

export default EnableDBForm;

