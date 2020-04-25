import React, { useState } from "react"
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Modal, Input, Radio, Select, Collapse, AutoComplete, InputNumber, Form } from 'antd';
import { getEventSourceFromType, getProjectConfig } from "../../utils";
import RadioCard from "../radio-card/RadioCard"
import FormItemLabel from "../form-item-label/FormItemLabel"
//import {dbIcons} from '../../utils';

const { Option } = AutoComplete;

const RuleForm = (props) => {
  const [form] = Form.useForm();

  const { projectID } = useParams()
  const projects = useSelector(state => state.projects)
  const handleSubmit = e => {
    form.validateFields().then(values => {
      let options = values.options
      if (options && !options.col) {
        delete options["col"]
      }

      props.handleSubmit(values.name, values.type, values.url, values.retries, values.timeout, options);
      props.handleCancel();
      form.resetFields();
    });
  }

  const { name, type, url, retries, timeout, options } = props.initialValues ? props.initialValues : {}
  let defaultEventSource = getEventSourceFromType(type, "database")
  const temp = form.getFieldValue("source")
  const eventSource = temp ? temp : defaultEventSource

  const selectedDb = form.getFieldValue("options.db")
  const collections = getProjectConfig(projects, projectID, `modules.db.${selectedDb}.collections`, {})
  const trackedCollections = Object.keys(collections);
  const data = trackedCollections.filter(name => name !== "default" && name !== "event_logs" && name !== "invocation_logs")

  const [value, setValue] = useState("");

  const handleSearch = value => {
    setValue(value);
  };

  return (
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Trigger`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}
        initialValues={{
          'name': name, 'source': defaultEventSource, 'options.db': options ? options.db : undefined,
          'options.col': options ? options.col : undefined, 'type': type ? type : (eventSource === "database" && "DB_INSERT"),
          'type': type ? type : (eventSource === "file storage" && "FILE_CREATE"), 'type': type, 'url': url, 'retries': retries ? retries : 3,
          'timeout': timeout ? timeout : 5000
        }}>
        <FormItemLabel name="Trigger name" />
        <Form.Item name="name" rules={[
          {
            validator: (_, value, cb) => {
              if (!value) {
                cb("Please provide a trigger name!")
                return
              }
              if (!(/^[0-9a-zA-Z_]+$/.test(value))) {
                cb("Trigger name can only contain alphanumeric characters and underscores!")
                return
              }
              cb()
            }
          }
        ]}>
          <Input placeholder="Trigger Name" />
        </Form.Item>
        <FormItemLabel name="Source" />
        <Form.Item name="source" rules={[{ required: true, message: 'Please select a source!' }]}>
          <Radio.Group>
            <RadioCard value="database">Database</RadioCard>
            <RadioCard value="file storage">File Storage</RadioCard>
            <RadioCard value="custom">Custom</RadioCard>
          </Radio.Group>
        </Form.Item>
        {(!eventSource || eventSource === "database") && <React.Fragment>
          <FormItemLabel name="Table/collection" />
          <div style={{ display: "flex" }}>
            <Form.Item name="options.db" rules={[{ required: true, message: 'Please select a database!' }]}
              style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
              <Select placeholder="Select a database">
                {props.dbList.map((alias) => (
                  <Select.Option value={alias.alias}><img src={alias.svgIconSet} style={{ marginRight: 10 }} />{alias.alias}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="options.col" style={{ flexGrow: 1, width: 200 }}>
              <AutoComplete placeholder="Collection / Table name" onSearch={handleSearch}>
                {
                  data.filter(data => (data.toLowerCase().indexOf(value.toLowerCase()) !== -1)).map(data => (
                    <Option key={data} value={data}>
                      {data}
                    </Option>
                  ))
                }
              </AutoComplete>
            </Form.Item>
          </div>
          <FormItemLabel name="Trigger operation" />
          <Form.Item name="type" rules={[{ required: true, message: 'Please select a type!' }]}>
            <Radio.Group>
              <RadioCard value="DB_INSERT">Insert</RadioCard>
              <RadioCard value="DB_UPDATE">Update</RadioCard>
              <RadioCard value="DB_DELETE">Delete</RadioCard>
            </Radio.Group>
          </Form.Item>
        </React.Fragment>}
        {(!eventSource || eventSource === 'file storage') && <React.Fragment>
          <FormItemLabel name="Trigger operation" />
          <Form.Item name="type" rules={[{ required: true, message: 'Please select a type!' }]}>
                <Radio.Group>
                  <RadioCard value="FILE_CREATE">Write</RadioCard>
                  <RadioCard value="FILE_DELETE">Delete</RadioCard>
                </Radio.Group>
          </Form.Item>
        </React.Fragment>}
        {eventSource === "custom" && <React.Fragment>
          <FormItemLabel name="Type" />
          <Form.Item name="type" rules={[
                {
                  validator: (_, value, cb) => {
                    if (!value) {
                      cb("Please provide event type!")
                      return
                    }
                    if (!(/^[0-9a-zA-Z_]+$/.test(value))) {
                      cb("Event type can only contain alphanumeric characters and underscores!")
                      return
                    }
                    cb()
                  }
                }
              ]}>
              <Input placeholder="Custom event type (Example: my_custom_event_type)" />
          </Form.Item>
        </React.Fragment>}
        <FormItemLabel name="Webhook URL" />
        <Form.Item name="url" rules={[{ required: true, message: 'Please provide a webhook url!' }]}>
            <Input placeholder="eg: https://myapp.com/endpoint1" />
        </Form.Item>
        <Collapse style={{ background: "white" }} bordered={false} >
          <Collapse.Panel header="Advanced settings" key="advanced">
            <FormItemLabel name="Retries" description="default: 3" />
            <Form.Item name="retries" >
              <InputNumber style={{ width: '100%' }} placeholder="Number of retries" />
            </Form.Item>
            <FormItemLabel name="Timeout" description="default: 5000" />
            <Form.Item name="timeout">
              <InputNumber style={{ width: '100%' }} placeholder="Timeout in milliseconds" />
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
    </Modal>
  );
}

export default RuleForm

