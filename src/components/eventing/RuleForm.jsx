import React, { useState } from "react"
import { useSelector } from 'react-redux';
import { Modal, Input, Radio, Select, Collapse, AutoComplete, InputNumber, Form } from 'antd';
import { getEventSourceFromType } from "../../utils";
import FormItemLabel from "../form-item-label/FormItemLabel"
import RadioCards from "../radio-cards/RadioCards";
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import { getTrackedCollections } from "../../operations/database";

const { Option } = AutoComplete;

const RuleForm = (props) => {
  const [form] = Form.useForm();

  const { id, type, url, retries, timeout, options } = props.initialValues ? props.initialValues : {}
  const [selectedDb, setSelectedDb] = useState(options && options.db ? options.db : "");
  const trackedCollections = useSelector(state => getTrackedCollections(state, selectedDb))

  const [value, setValue] = useState("");

  const formInitialValues = {
    'id': id,
    'source': getEventSourceFromType(type, "database"),
    'type': type ? type : "DB_INSERT",
    'options': options ? options : {},
    'url': url,
    'retries': retries ? retries : 3,
    'timeout': timeout ? timeout : 5000
  }

  const handleSearch = value => setValue(value);
  const handleSelectDatabase = value => setSelectedDb(value)
  const handleSourceChange = () => form.setFieldsValue({ type: undefined })

  const handleSubmit = e => {
    form.validateFields().then(values => {
      values = Object.assign({}, formInitialValues, values)
      let options = values.options
      if (options && !options.col) {
        delete options["col"]
      }

      props.handleSubmit(values.id, values.type, values.url, values.retries, values.timeout, options).then(() => {
        props.handleCancel();
        form.resetFields();
      })
    });
  }

  return (
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Trigger`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form} initialValues={formInitialValues}>
        <FormItemLabel name="Trigger name" />
        <Form.Item name="id" rules={[
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
          <Input placeholder="Trigger Name" disabled={id} />
        </Form.Item>
        <FormItemLabel name="Source" />
        <Form.Item name="source" rules={[{ required: true, message: 'Please select a source!' }]}>
          <RadioCards onChange={handleSourceChange}>
            <Radio.Button value="database">Database</Radio.Button>
            <Radio.Button value="file storage">File Storage</Radio.Button>
            <Radio.Button value="custom">Custom</Radio.Button>
          </RadioCards>
        </Form.Item>
        <ConditionalFormBlock dependency="source" condition={() => form.getFieldValue("source") === "database"}>
          <FormItemLabel name="Table/collection" />
          <Input.Group compact>
            <Form.Item name={["options", "db"]} rules={[{ required: true, message: 'Please select a database!' }]}
              style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
              <AutoComplete placeholder="Select a database" onChange={handleSelectDatabase} options={props.dbList.map(db => ({ value: db }))} />
            </Form.Item>
            <Form.Item name={["options", "col"]} style={{ flexGrow: 1, width: 200 }} >
              <AutoComplete placeholder="Collection / Table name" onSearch={handleSearch} >
                {
                  trackedCollections.filter(data => (data.toLowerCase().indexOf(value.toLowerCase()) !== -1)).map(data => (
                    <Option key={data} value={data}>
                      {data}
                    </Option>
                  ))
                }
              </AutoComplete>
            </Form.Item>
          </Input.Group>
          <FormItemLabel name="Trigger operation" />
          <Form.Item
            name="type"
            dependencies={["source"]}
            rules={[{ required: true, message: 'Please select a type!' }]}>
            <RadioCards defaultValue="DB_INSERT">
              <Radio.Button value="DB_INSERT">Insert</Radio.Button>
              <Radio.Button value="DB_UPDATE">Update</Radio.Button>
              <Radio.Button value="DB_DELETE">Delete</Radio.Button>
            </RadioCards>
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="source" condition={() => form.getFieldValue("source") === "file storage"}>
          <FormItemLabel name="Trigger operation" />
          <Form.Item
            name="type"
            dependencies={["source"]}
            rules={[{ required: true, message: 'Please select a type!' }]}>
            <RadioCards defaultValue="FILE_CREATE">
              <Radio.Button value="FILE_CREATE">Write</Radio.Button>
              <Radio.Button value="FILE_DELETE">Delete</Radio.Button>
            </RadioCards>
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="source" condition={() => form.getFieldValue("source") === "custom"}>
          <FormItemLabel name="Type" />
          <Form.Item
            name="type"
            dependencies={["source"]}
            rules={[
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
            <Input placeholder="Custom event type (Example: my_custom_event_type)" defaultValue="" />
          </Form.Item>
        </ConditionalFormBlock>
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

