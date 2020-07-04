import React, { useState, useEffect } from 'react';
import { Modal, Form, Switch, Input, Checkbox } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify, getDBTypeFromAlias } from '../../../utils';

const AddCollectionForm = ({ editMode, projectId, selectedDB, handleSubmit, handleCancel, initialValues, conformLoading }) => {
  const [form] = Form.useForm();
  const [colName, setcolName] = useState('')

  const dbType = getDBTypeFromAlias(projectId, selectedDB)

  const defaultSchema = `type ${(initialValues && initialValues.name) ? initialValues.name : ""}{
  ${(dbType === 'mongo' || dbType === 'embedded') ? '_id' : 'id'}: ID! @primary
}`

  const initialSchema = (initialValues && initialValues.schema) ? initialValues.schema : defaultSchema

  if (!initialValues) {
    initialValues = {
      isRealtimeEnabled: true
    }
  }

  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(initialValues.isRealtimeEnabled);
  const [schema, setSchema] = useState(initialSchema);

  const handleChangedValues = ({ name }) => { setcolName(name) };
  useEffect(() => {
    if (schema && colName) {
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
    form.validateFields().then(values => {
      try {
        handleSubmit(
          values.name,
          schema,
          isRealtimeEnabled
        );
      } catch (ex) {
        notify("error", "Error", ex.toString())
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
        <Form layout="vertical" form={form} onFinish={handleSubmitClick} onValuesChange={handleChangedValues}
          initialValues={{
            'name': initialValues.name,
          }}>
          <FormItemLabel name={dbType === 'mongo' ? 'Collection Name' : 'Table Name'} />
          <Form.Item name="name" rules={[{
            validator: (_, value, cb) => {
              if (!value) {
                cb(`${dbType === 'mongo' ? 'Collection' : 'Table'} name is required`)
                return
              }
              if (!(/^[0-9a-zA-Z_]+$/.test(value))) {
                cb(`${dbType === 'mongo' ? 'Collection' : 'Table'} name can only contain alphanumeric characters and underscores!`)
                return
              }
              cb()
            }
          }]}>
            <Input
              className="input"
              placeholder={`Enter ${dbType === "mongo" ? "Collection" : "Table"} name`}
              disabled={editMode}
            />
          </Form.Item>

          <FormItemLabel name="Realtime subscriptions" />
          <Form.Item name="realtime">
            <span className='realtime'>
              Enabled: <Switch defaultChecked={initialValues.isRealtimeEnabled} onChange={onSwitchChange} />
            </span>
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
        </Form>
      </Modal>
    </div>
  );
}

export default AddCollectionForm;
