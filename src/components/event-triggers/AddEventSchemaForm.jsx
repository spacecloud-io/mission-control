import React, { useState, useEffect } from 'react';
import { Modal, Switch, Form, Input, Row, Col } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify, getDBTypeFromAlias } from '../../utils';

const AddCollectionForm = ({ form, editMode, projectId, selectedDB, handleSubmit, handleCancel, initialValues, conformLoading }) => {
  const { getFieldDecorator, getFieldValue } = form;

  const dbType = getDBTypeFromAlias(projectId, selectedDB)

  if (!initialValues) {
    initialValues = {
      schema: `type {
  ${dbType === 'mongo' ? '_id' : 'id'}: ID! @primary
}`,
    }
  }

  const [schema, setSchema] = useState(initialValues.schema);

  const colName = getFieldValue("name")
  useEffect(() => {
    if (schema) {
      const temp = schema.trim().slice(4).trim()
      const index = temp.indexOf("{")
      const newSchema = colName ? `type ${colName} ${temp.slice(index)}` : `type ${temp.slice(index)}`
      setSchema(newSchema)
    }
  }, [colName])


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
        okText={editMode ? "Save" : "Add"}
        title={`${editMode ? "Edit" : "Add"} ${dbType === "mongo" ? "Collection" : "Table"}`}
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
              <Input
                className="input"
                placeholder={`Enter event type`}
                disabled={editMode}
              />
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

export default Form.create({})(AddCollectionForm);
