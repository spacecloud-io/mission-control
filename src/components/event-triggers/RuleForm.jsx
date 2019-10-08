import React from "react"

import { Modal, Form, Input, Radio, Select, InputNumber } from 'antd';
import { getEventSourceFromType } from "../../utils";

const RuleForm = (props) => {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(values.name, values.type, values.service, values.func, values.retries, values.options);
        props.handleCancel();
        props.form.resetFields();
      }
    });
  }
  const { getFieldDecorator, getFieldValue } = props.form;
  const { name, type, service, func, retries, options } = props.initialValues ? props.initialValues : {}
  let defaultEventSource = getEventSourceFromType(type, "database")
  const temp = getFieldValue("source")
  const eventSource = temp ? temp : defaultEventSource
  return (
    <Modal
      className="edit-item-modal"
      title={`${props.initialValues ? "Edit" : "Add"} Trigger`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <p><b>Trigger Name</b></p>
        <Form.Item>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please provide a name to trigger!' }],
            initialValue: name
          })(
            <Input disabled={props.initialValues} placeholder="Trigger Name" />
          )}
        </Form.Item>
        <p><b>Source</b></p>
        <Form.Item>
          {getFieldDecorator('source', {
            rules: [{ required: true, message: 'Please select a source!' }],
            initialValue: defaultEventSource
          })(
            <Radio.Group>
              <Radio.Button value="database">Database</Radio.Button>
              <Radio.Button value="custom">Custom</Radio.Button>
            </Radio.Group>
          )}
        </Form.Item>
        {(!eventSource || eventSource === "database") && <React.Fragment>
          <p><b>Type</b></p>
          <Form.Item>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: 'Please select a type!' }],
              initialValue: type
            })(
              <Radio.Group>
                <Radio.Button value="create-crud">Insert</Radio.Button>
                <Radio.Button value="update-crud">Update</Radio.Button>
                <Radio.Button value="delete-crud">Delete</Radio.Button>
              </Radio.Group>
            )}
          </Form.Item>
          <p><b>Database</b></p>
          <div style={{ display: "flex" }}>
            <Form.Item style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
              {getFieldDecorator('options.db', {
                rules: [{ required: true, message: 'Please select a database!' }],
                initialValue: options ? options.db : undefined
              })(
                <Select placeholder="Select a database">
                  <Select.Option value="mongo">MongoDB</Select.Option>
                  <Select.Option value="sql-postgres">PostgreSQL</Select.Option>
                  <Select.Option value="sql-mysql">MySQL</Select.Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item style={{ flexGrow: 1, width: 200 }}>
              {getFieldDecorator('options.col', {
                rules: [{ required: true, message: 'Please provide a collection/table!' }],
                initialValue: options ? (options.col ? options.col : "all") : undefined
              })(
                <Input placeholder="Collection / Table name" />
              )}
            </Form.Item>
          </div>
        </React.Fragment>}
        {eventSource === "custom" && <React.Fragment>
          <p><b>Type</b></p>
          <Form.Item>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: 'Please provide a type!' }],
              initialValue: type
            })(
              <Input placeholder="Custom event type (Example: my-custom-event-type)" />
            )}
          </Form.Item>
        </React.Fragment>}
        <p><b>Target</b></p>
        <div style={{ display: "flex" }}>
          <Form.Item style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
            {getFieldDecorator('service', {
              rules: [{ required: true, message: 'Please provide a service name!' }],
              initialValue: service
            })(
              <Input placeholder="Service name" />
            )}
          </Form.Item>
          <Form.Item style={{ flexGrow: 1, width: 200 }}>
            {getFieldDecorator('func', {
              rules: [{ required: true, message: 'Please provide a function name!' }],
              initialValue: func
            })(
              <Input placeholder="Function name" />
            )}
          </Form.Item>
        </div>
        <p><b>Retries</b></p>
        <Form.Item>
          {getFieldDecorator('retries', { initialValue: retries === undefined ? 3 : retries })(<InputNumber min={0} />)}
        </Form.Item>
      </Form>
    </Modal>
  );
}

const WrappedRuleForm = Form.create({})(RuleForm);

export default WrappedRuleForm

