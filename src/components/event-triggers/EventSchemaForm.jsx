import React, { useState, useEffect } from 'react';
import { Modal, Form, AutoComplete, Row, Col } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify } from '../../utils';

const EventSchemaForm = ({ form, handleSubmit, handleCancel, initialValues, customEventTypes, conformLoading }) => {
  const { getFieldDecorator, getFieldValue } = form;

  const eventType = getFieldValue("eventType");

  if (!initialValues) {
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
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        try {
          handleSubmit(
            values.eventType,
            schema
          );
        } catch (ex) {
          notify("error", "Error", ex.toString())
        }
      }
    });
  };


  return (
    <div>
      <Modal
        className='edit-item-modal'
        visible={true}
        width={520}
        okText="Add"
        title="Add event schema"
        onOk={handleSubmitClick}
        confirmLoading={conformLoading}
        onCancel={handleCancel}
      >
        <Form layout="vertical" onSubmit={handleSubmitClick}>
          <FormItemLabel name='Event Type' />
          <Form.Item>
            {getFieldDecorator("eventType", {
              rules: [{ required: true, message: `Event type is required` }],
              initialValue: initialValues.eventType
            })(
              <AutoComplete
                placeholder="Example: event-type"
              >
                {customEventTypes.filter(value => eventType ? (value.toLowerCase().includes(eventType.toLowerCase())) : true).map(type => (
                  <AutoComplete.Option key={type}>{type}</AutoComplete.Option>
                ))}
              </AutoComplete>
            )}
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

export default Form.create({})(EventSchemaForm);
