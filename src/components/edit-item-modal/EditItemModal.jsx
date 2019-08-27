import React from 'react';
import { Modal, Row, Col, Switch } from 'antd';
import Header from '../header/Header';
import './edit-item-modal.css';
import { Form, Input, Button } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

function EditItemModal(props) {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) { 
        props.handleSubmit(values);
        props.handleCancel();
        props.form.resetFields();
      }
    });
  };
  const { getFieldDecorator } = props.form;
  const { TextArea } = Input;

  return (
    <div>
      <Modal
        className='edit-item-modal'
        footer={null}
        title={props.heading}
        visible={props.visible}
        onCancel={props.handleCancel}
      >
        <div className='modal-flex'>
          <div className='content'>
            <Form onSubmit={handleSubmit} className='edit-form'>
              <span className='tablename'>Table Name</span>
              <Form.Item>
                {getFieldDecorator('item', {
                  rules: [
                    { required: true, message: 'Please input a valid value!' }
                  ]
                })(<Input className='input' placeholder='Enter table name' />)}
                {getFieldDecorator('realtime', {
                  initialValue: props.initialValue
                })(
                  <span className='realtime'>
                    Realtime <Switch defaultChecked />
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
                      initialValue: props.rulesInitialValue
                    })(<TextArea rows={8} />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <span className='form-title'>Schema</span>
                  <br />
                  <FormItem>
                    {getFieldDecorator('schema', {
                      initialValue: props.schemaInitialValue
                    })(<TextArea rows={8} />)}
                  </FormItem>
                </Col>
              </Row>
              <Form.Item>
                {/*                 <Button type="primary" htmlType="submit" className="button">
                  DONE
                </Button> */}
                <div className='form-bottom'>
                  <Button size='large' className='cancel-btn'>
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
  EditItemModal
);

export default WrappedNormalLoginForm;
