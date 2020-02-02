import React, { useState, useEffect } from 'react';
import { Modal, Switch, Form, Input, Row, Col, Checkbox } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { defaultDBRules } from '../../../constants';
import { notify, getDBTypeFromAlias } from '../../../utils';

const AddCollectionForm = ({ form, editMode, projectId, selectedDB, handleSubmit, handleCancel, initialValues, conformLoading, defaultRules }) => {
  const { getFieldDecorator, getFieldValue } = form;

  const dbType = getDBTypeFromAlias(projectId, selectedDB)

  if (!initialValues) {
    initialValues = {
      schema: `type {
  ${dbType === 'mongo' ? '_id' : 'id'}: ID! @primary
}`,
      rules: defaultRules,
      isRealtimeEnabled: true
    }
  }

  const [rule, setRule] = useState(JSON.stringify(initialValues.rules, null, 2));
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(initialValues.isRealtimeEnabled);
  const [schema, setSchema] = useState(initialValues.schema);
  const [applyDefaultRules, setApplyDefaultRules] = useState(editMode ?  rule === "{}" : true);

  if (Object.keys(initialValues.rules).length === 0) {
    initialValues.rules = defaultRules
  }

  const colName = getFieldValue("name")
  useEffect(() => {
    if (schema) {
      const temp = schema.trim().slice(4).trim()
      const index = temp.indexOf("{")
      const newSchema = colName ? `type ${colName} ${temp.slice(index)}` : `type ${temp.slice(index)}`
      setSchema(newSchema)
    }
  }, [colName])

  const onSwitchChange = checked => {
    setIsRealtimeEnabled(checked);
  };

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        try {
          handleSubmit(
            values.name,
            applyDefaultRules ? {} : JSON.parse(rule),
            schema,
            isRealtimeEnabled
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
          <FormItemLabel name={dbType === 'mongo' ? 'Collection Name' : 'Table Name'} />
          <Form.Item>
            {getFieldDecorator("name", {
              rules: [{ required: true, message: `${dbType === 'mongo' ? 'Collection' : 'Table'} name is required` }],
              initialValue: initialValues.name
            })(
              <Input
                className="input"
                placeholder={`Enter ${dbType === "mongo" ? "Collection" : "Table"} name`}
                disabled={editMode}
              />
            )}
          </Form.Item>

          <FormItemLabel name="Realtime subscriptions" />
          <Form.Item>
            {getFieldDecorator('realtime')(
              <span className='realtime'>
                Enabled: <Switch defaultChecked={initialValues.isRealtimeEnabled} onChange={onSwitchChange} />
              </span>
            )}
          </Form.Item>
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
          <div style={{paddingTop:20}}>
            <Checkbox
              checked={applyDefaultRules}
              onChange={e =>
                setApplyDefaultRules(!applyDefaultRules)
              }
            >Apply default security rules</Checkbox>
          </div>
          {!applyDefaultRules ? <div style={{ paddingTop: 20 }}>
            <FormItemLabel name="Rule" />
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
          </div> : ""}
        </Form>
      </Modal>
    </div>
  );
}

export default Form.create({})(AddCollectionForm);
