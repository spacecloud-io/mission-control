import React, { useState } from "react"

import { Controlled as CodeMirror } from 'react-codemirror2';
import { Modal, Card, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import jwt from 'jsonwebtoken';
import { notify } from "../../../utils";

const GenerateTokenForm = (props) => {
  const [form] = Form.useForm();
  const decodedClaims = jwt.decode(props.initialToken)
  const initialPayload = decodedClaims ? decodedClaims : {}

  const [data, setData] = useState(JSON.stringify(initialPayload, null, 2))
  const generatedToken = jwt.sign(data, props.secret)

  const handleSubmit = e => {
    form.validateFields().then(values => {
      try {
        JSON.parse(data)
        props.handleSubmit(jwt.sign(data, props.secret));
        props.handleCancel();
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    });
  };

  return (
    <Modal
      title="Generate token"
      visible={true}
      width={720}
      okText="Use this token"
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <FormItemLabel name="Token claims" />
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
        <div style={{ paddingTop: 16 }}>
          <FormItemLabel name="Generated token" />
          <Card bodyStyle={{ backgroundColor: "#F2F2F2" }}>
            <h4>{generatedToken}</h4>
          </Card>
        </div>
      </Form>
    </Modal>
  )
}

export default GenerateTokenForm