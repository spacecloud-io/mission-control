import React, { useState, useEffect } from 'react';
import { Modal, AutoComplete, Row, Col, Form } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify } from '../../utils';

const EventSchemaForm = ({ handleSubmit, handleCancel, initialValues, customEventTypes }) => {
  const [form] = Form.useForm()
  const [eventType, setEventType] = useState(initialValues.eventType);
  const handleChangedValues = ({ eventType }) => {
    setEventType(eventType);
  }

  if (!initialValues.schema) {
    initialValues = {
      schema: `type {
  
}`,
    }
  }

  const [schema, setSchema] = useState(initialValues.schema);

  useEffect(() => {
    if (schema) {
      const temp = schema.trim().slice(4).trim()
      const index = temp.indexOf("{")
      const newSchema = eventType ? `type ${eventType} ${temp.slice(index)}` : `type ${temp.slice(index)}`
      setSchema(newSchema)
    }
  }, [eventType])


  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      try {
        handleSubmit(values.eventType, schema)
          .then(() => handleCancel())
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    });
  }


  return (
    <div>
      <Modal
        className='edit-item-modal'
        visible={true}
        width={520}
        okText={initialValues.eventType ? "Edit" : "Add"}
        title={initialValues.eventType ? "Edit event schema" : "Add event schema"}
        onOk={handleSubmitClick}
        onCancel={handleCancel}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmitClick} onValuesChange={handleChangedValues} initialValues={{ 'eventType': eventType }}>
          <FormItemLabel name='Event Type' />
          <Form.Item name="eventType" rules={[{ required: true, message: `Event type is required` }]}>
            <AutoComplete
              placeholder="Example: event-type"
            >
              {customEventTypes.filter(value => eventType ? (value.toLowerCase().includes(eventType.toLowerCase())) : true).map(type => (
                <AutoComplete.Option key={type}>{type}</AutoComplete.Option>
              ))}
            </AutoComplete>
          </Form.Item>
          <Row>
            <Col span={24}>
              <FormItemLabel name="Schema" />
              <CodeMirror
                value={schema}
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
                  setSchema(value)
                }}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default EventSchemaForm;
