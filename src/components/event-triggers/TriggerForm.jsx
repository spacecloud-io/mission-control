import React, { useState } from "react"

import { Controlled as CodeMirror } from 'react-codemirror2';
import { Modal, Form, } from 'antd';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'

const TriggerForm = (props) => {
  const [payload, setPayload] = useState("{}")
  const handleSubmit = e => {
    e.preventDefault();
    props.handleSubmit(payload);
    props.handleCancel();
  }

  return (
    <Modal
      className="edit-item-modal"
      title="Trigger Event"
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <p><b>Payload object</b></p>
        <CodeMirror
          value={payload}
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
            setPayload(value)
          }}
        />
      </Form>
    </Modal>
  );
}


export default TriggerForm

