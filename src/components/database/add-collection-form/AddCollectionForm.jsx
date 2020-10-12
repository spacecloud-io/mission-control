import React, { useState, useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import "./add-collection.css"

const AddCollectionForm = ({ editMode, dbType, handleSubmit, handleCancel, initialValues }) => {
  const [form] = Form.useForm();
  const [colName, setcolName] = useState('')

  const defaultSchema = `type ${(initialValues && initialValues.name) ? initialValues.name : ""}{
  ${(dbType === 'mongo' || dbType === 'embedded') ? '_id' : 'id'}: ID! @primary
}`

  const initialSchema = (initialValues && initialValues.schema) ? initialValues.schema : defaultSchema

  if (!initialValues) {
    initialValues = {}
  }

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

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      handleSubmit(values.name, schema).then(() => handleCancel())
    });
  };


  return (
    <div>
      <Modal
        className='add-collection-modal'
        visible={true}
        width={720}
        okText={editMode ? "Save" : "Add"}
        title={`${editMode ? "Edit" : "Add"} ${dbType === "mongo" ? "Collection" : "Table"}`}
        onOk={handleSubmitClick}
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
              autoFocus={true}
            />
          </Form.Item>
          <FormItemLabel name="Schema" />
          <CodeMirror
            style={{ height: 420 }}
            value={schema}
            options={{
              mode: { name: "javascript", json: true },
              lineNumbers: true,
              styleActiveLine: true,
              matchBrackets: true,
              autoCloseBrackets: true,
              tabSize: 2,
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
