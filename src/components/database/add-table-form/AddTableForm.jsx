import React, { useState } from 'react';
import { Modal, Switch, Form, Input, Row, Col } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'

function AddTableForm(props) {
  const { getFieldDecorator } = props.form;

  const initialSchema = `type {
  ${props.selectedDb === 'mongo' ? '_id' : 'id'}: ID! @id
}`

  const initalRule = {
    create: {
      rule: 'allow'
    },
    read: {
      rule: 'allow'
    },
    update: {
      rule: 'allow'
    },
    delete: {
      rule: 'allow'
    }
  };

  const [schema, setSchema] = useState(initialSchema);
  const [rule, setRule] = useState(JSON.stringify(initalRule, null, 2));
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  const onSwitchChange = checked => {
    setRealTimeEnabled(checked);
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(
          values.name,
          rule,
          schema,
          realTimeEnabled
        );
        props.handleCancel();
      }
    });
  };

  const handleNameChange = e => {
    const name = e.target.value
    const schema = `type ${name} {
  ${props.selectedDb === 'mongo' ? '_id' : 'id'}: ID! @id
}`

    setSchema(schema)
  };


  return (
    <div>
      <Modal
        className='edit-item-modal'
        visible={true}
        width={720}
        okText="Add"
        title={
          props.selectedDb === 'mongo' ? 'Add a Collection' : 'Add a Table'
        }
        onCancel={props.handleCancel}
      >
        <Form layout="vertical" onSubmit={handleSubmit}>
          <FormItemLabel name={props.selectedDb === 'mongo' ? 'Collection Name' : 'Table Name'} />
          <Form.Item>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: `${props.selectedDb === 'mongo' ? 'Collection' : 'Table'} name is required` }]
            })(
              <Input
                className='input'
                placeholder={
                  props.selectedDb === 'mongo'
                    ? 'Enter a collection'
                    : 'Enter a table'
                }
                onChange={handleNameChange}
              />
            )}
          </Form.Item>

          <FormItemLabel name="Realtime subscriptions" />
          <Form.Item>
            {getFieldDecorator('realtime')(
              <span className='realtime'>
                Enabled: <Switch defaultChecked onChange={onSwitchChange} />
              </span>
            )}
          </Form.Item>
          <Row>
            <Col span={12}>
              <FormItemLabel name="Schema" />
              <CodeMirror
                value={schema}
                options={{
                  mode: { name: "graphql" },
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
            <Col>
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
                  autofocus: true
                }}
                onBeforeChange={(editor, data, value) => {
                  setRule(value)
                }}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

const WrappedAddTableForm = Form.create({})(AddTableForm);

export default WrappedAddTableForm;
