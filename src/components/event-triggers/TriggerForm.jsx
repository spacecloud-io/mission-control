import React, { useState } from "react"

import { Controlled as CodeMirror } from 'react-codemirror2';
import { Modal, Form, } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify } from "../../utils";

const TriggerForm = (props) => {
  const [data, setData] = useState("{}")
  const handleSubmit = e => {
    e.preventDefault();
    try {
      props.handleSubmit(JSON.parse(data));
      props.handleCancel();
    } catch (ex) {
      notify("error", "Error", ex.toString())
    }
  }

  return (
    <Modal
      className="edit-item-modal"
      title="Trigger Event"
      visible={true}
      okText="Trigger"
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Event data" description="JSON object" />
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


export default TriggerForm

