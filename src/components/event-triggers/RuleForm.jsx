import React from "react"

import { Modal, Form, Input, Radio, Select, Collapse } from 'antd';
import { getEventSourceFromType } from "../../utils";
import RadioCard from "../radio-card/RadioCard"
import FormItemLabel from "../form-item-label/FormItemLabel"

const RuleForm = (props) => {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.handleSubmit(values.name, values.type, values.url, values.retries, values.timeout, values.options);
        props.handleCancel();
        props.form.resetFields();
      }
    });
  }
  const { getFieldDecorator, getFieldValue } = props.form;
  const { name, type, url, retries, timeout, options } = props.initialValues ? props.initialValues : {}
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
        <FormItemLabel name="Trigger name" />
        <Form.Item>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please provide a name to trigger!' }],
            initialValue: name
          })(
            <Input disabled={props.initialValues} placeholder="Trigger Name" />
          )}
        </Form.Item>
        <FormItemLabel name="Source" />
        <Form.Item>
          {getFieldDecorator('source', {
            rules: [{ required: true, message: 'Please select a source!' }],
            initialValue: defaultEventSource
          })(
            <Radio.Group>
              <RadioCard value="database">Database</RadioCard>
              <RadioCard value="custom">Custom</RadioCard>
            </Radio.Group>
          )}
        </Form.Item>
        {(!eventSource || eventSource === "database") && <React.Fragment>
          <FormItemLabel name="Table/collection" />
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
          <FormItemLabel name="Trigger operation" />
          <Form.Item>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: 'Please select a type!' }],
              initialValue: type ? type : (eventSource === "database" && "DB_INSERT")
            })(
              <Radio.Group>
                <RadioCard value="DB_INSERT">Insert</RadioCard>
                <RadioCard value="DB_UPDATE">Update</RadioCard>
                <RadioCard value="DB_DELETE">Delete</RadioCard>
              </Radio.Group>
            )}
          </Form.Item>
        </React.Fragment>}
        {eventSource === "custom" && <React.Fragment>
          <FormItemLabel name="Type" />
          <Form.Item>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: 'Please provide a type!' }],
              initialValue: type
            })(
              <Input placeholder="Custom event type (Example: my-custom-event-type)" />
            )}
          </Form.Item>
        </React.Fragment>}
        <FormItemLabel name="Webhook URL" />
        <Form.Item >
          {getFieldDecorator('url', {
            rules: [{ required: true, message: 'Please provide a webhook url!' }],
            initialValue: url
          })(
            <Input placeholder="eg: https://myapp.com/endpoint1" />
          )}
        </Form.Item>
        <Collapse bordered={false} >
          <Collapse.Panel header="Advanced settings" key="advanced">
            <FormItemLabel name="Retries" description="default: 3" />
            <Form.Item>
              {getFieldDecorator('retries', { initialValue: retries })(<Input placeholder="Number of retries" />)}
            </Form.Item>
            <FormItemLabel name="Timeout" description="default: 5000" />
            <Form.Item>
              {getFieldDecorator('timeout', { initialValue: timeout })(<Input placeholder="Timeout in milliseconds" />)}
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
    </Modal>
  );
}

const WrappedRuleForm = Form.create({})(RuleForm);

export default WrappedRuleForm

