import React, { useState } from 'react';
import { Modal, Row, Col, Switch } from 'antd';
import './collection-form.css';
import { Form, Input, Button } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

let initalSchema = '';

function NewCollectionForm(props) {
  const [schemaName, setSchemaName] = useState('');
  const [switchChecked, setSwitchChecked] = useState(true);

  initalSchema = `type ${schemaName} {}`

  const onSwitchChange = checked => {
    setSwitchChecked(checked);
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(
          values.item,
          values.rules,
          values.schema,
          values.realtime
        );
        props.handleCancel();
        props.form.resetFields();
      }
    });
  };

  const handleNameChange = e => {
    setSchemaName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
  };
  const { getFieldDecorator } = props.form;
  const { TextArea } = Input;

  // inital rule & schema value
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

  return (
    <div>
      <Modal
        className='edit-item-modal'
        footer={null}
        title={
          props.selectedDb === 'mongo' ? 'Add a Collection' : 'Add a Table'
        }
        visible={props.visible}
        onCancel={props.handleCancel}
      >
        <div className='modal-flex'>
          <div className='content'>
            <Form onSubmit={handleSubmit} className='edit-form'>
              <span className='tablename'>{ props.selectedDb === 'mongo' ? 'Collection Name' : 'Table Nmae'}</span>
              <Form.Item>
                {getFieldDecorator('item', {
                  rules: [
                    { required: true, message: 'Please input a valid value!' }
                  ]
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
                {getFieldDecorator('realtime', {
                  initialValue: switchChecked
                })(
                  <span className='realtime'>
                    Realtime <Switch defaultChecked onChange={onSwitchChange} />
                  </span>
                )}
              </Form.Item>
              <br />
              <div className='settings-box'>
                <span className='settings-heading'>Settings</span>
                <span className='settings-default'>{'(DEFAULT)'}</span>
                <br />
                <span className='settings-subheading'>
                  You can change these later
                </span>
              </div>
              <br />
              <Row gutter={16}>
                <Col span={12}>
                  <span className='form-title'>Rules</span>
                  <br />
                  <FormItem>
                    {getFieldDecorator('rules', {
                      initialValue: JSON.stringify(initalRule, null, 2)
                    })(<TextArea rows={8} />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <span className='form-title'>Schema</span>
                  <br />
                  <FormItem>
                    {getFieldDecorator('schema', {
                      initialValue: initalSchema
                    })(<TextArea rows={8} />)}
                  </FormItem>
                </Col>
              </Row>
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
                    Save
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
