import React, { useState } from 'react';
import { Modal, Row, Col, Switch, Form, Input, Button } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import './collection-form.css';

function NewCollectionForm(props) {
  const { getFieldDecorator } = props.form;

  const initialSchema = `type {
  ${props.selectedDb === 'mongo' ? '_id' : 'id'} ID! @id
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
  ${props.selectedDb === 'mongo' ? '_id' : 'id'} ID! @id
}`

    setSchema(schema)
  };


  return (
    <div>
      <Modal
        className='form-modal'
        footer={null}
        visible={true}
        width={900}
        title={
          props.selectedDb === 'mongo' ? 'Add a Collection' : 'Add a Table'
        }
        onCancel={props.handleCancel}
      >
        <div className='modal-flex'>
          <div className='content'>
            <Form onSubmit={handleSubmit} className='edit-form'>
              <span className='tablename'>{props.selectedDb === 'mongo' ? 'Collection Name' : 'Table Name'}</span>
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
                {getFieldDecorator('realtime')(
                  <span className='realtime'>
                    Realtime <Switch defaultChecked onChange={onSwitchChange} />
                  </span>
                )}
              </Form.Item>
              <br />
              <Row gutter={16}>
                <Col span={12}>
                  <span className='form-title'>Schema</span>
                  <br />
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
                <Col span={12}>
                  <span className='form-title'>Rules</span>
                  <br />
                  <CodeMirror
                    value={rule}
                    options={{
                      mode: { name: "javascript", json: true },
                      lineNumbers: true,
                      styleActiveLine: true,
                      matchBrackets: true,
                      autoCloseBrackets: true,
                      tabSize: 2
                    }}
                    onBeforeChange={(editor, data, value) => {
                      setRule(value)
                    }}
                  />
                </Col>
              </Row>
              <br />
              <Form.Item>
                <div className='form-bottom'>
                  <Button
                    size='large'
                    className='cancel-btn'
                    onClick={props.handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='primary'
                    size='large'
                    htmlType='submit'
                    className='save-btn'
                  >
                    Add
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(
  NewCollectionForm
);

export default WrappedNormalLoginForm;
