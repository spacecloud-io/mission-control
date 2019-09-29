import React from 'react'
import './db-configure.css'
import { Form, Input, Tooltip, Switch, Button } from 'antd';
import { createFormField } from 'rc-form';

function DbConfigure(props) {
  const { getFieldDecorator } = props.form;
  return (
    <div className="configuration">
      <Form className="conn-form" layout="inline">
        <Form.Item>
          <div className="conn-string">Connection String:</div>
          {getFieldDecorator('conn', {
            rules: [{ required: true, message: 'Please input a connection string!' }],
          })(
            <Input.Password style={{ width: 350 }}
              placeholder="Enter connection string"
            />,
          )}
          <Tooltip placement="bottomLeft" title="This is the connection string of your database so that Space Cloud can connect to it.">
            <span style={{ height: 20, marginLeft: '16px' }}><i className="material-icons help">help_outline</i></span>
          </Tooltip>
        </Form.Item>
        {(props.dbType !== 'mongo') &&
          <Button disabled={!props.setUpDb} onClick={props.handleSetUpDb} type="primary">Set Up Database</Button>
        }
        <Form.Item label="Enabled" >
          {getFieldDecorator('enabled', { valuePropName: 'checked' })(
            <Switch size="small" />
          )}
        </Form.Item>
      </Form>
    </div>
  )
}

const WrappedDbConfigureForm = Form.create({
  mapPropsToFields(props) {
    return {
      conn: createFormField({ value: props.formState.conn }),
      enabled: createFormField({ value: props.formState.enabled }),
    };
  },
  onValuesChange(props, changedValues) {
    props.updateFormState(changedValues)
  },
})(DbConfigure);

export default WrappedDbConfigureForm
