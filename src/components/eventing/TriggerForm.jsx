import React, { useState } from "react"

import { Controlled as CodeMirror } from 'react-codemirror2';
import { Modal, Form, Checkbox } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify, parseJSONSafely } from "../../utils";

const TriggerForm = (props) => {
  const [data, setData] = useState("{}")
  const [eventResponse, setEventResponse] = useState("")
  const [triggeredEventOnce, setTriggeredEventOnce] = useState(false)
  const { getFieldDecorator } = props.form;

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, fieldsValue) => {
      if (!err) {
        try {
          props.handleSubmit(JSON.parse(data), fieldsValue["isSynchronous"]).then(res => {
            notify("success", "Success", "Event successfully queued to Space Cloud")
            setEventResponse(JSON.stringify(parseJSONSafely(res), null, 2))
            if (!triggeredEventOnce) setTriggeredEventOnce(true)
          }).catch(ex => notify("error", "Error", ex.toString()))
        } catch (ex) {
          notify("error", "Error", ex.toString())
        }
      }
    });
  }


  return (
    <Modal
      title="Trigger Event"
      visible={true}
      okText={triggeredEventOnce ? "Trigger another event" : "Trigger"}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <Form.Item>
          {getFieldDecorator('isSynchronous', {
            initialValue: false,
            valuePropName: "checked"
          })(
            <Checkbox>Trigger event synchronously</Checkbox>
          )}
        </Form.Item>
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
      {eventResponse && <React.Fragment>
        <br/>
        <FormItemLabel name="Response" />
        <pre>{eventResponse}</pre>
      </React.Fragment>}
    </Modal>
  );
}


export default Form.create({})(TriggerForm)

