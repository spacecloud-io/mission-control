import React, { useState } from "react"
import { Modal, Select, Input, Form, Button, Space, AutoComplete } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import { useSelector } from 'react-redux'
import { getTrackedCollections } from '../../operations/database';
const { Option } = Select;

const FilterEvents = ({ handleCancel, handleSubmit, initialValues, dbList }) => {
  const [form] = Form.useForm();

  const formInitialValue = {
    source: initialValues ? initialValues.source : '',
    options: {
      db: initialValues && initialValues.options ? initialValues.options.db : '',
      col: initialValues && initialValues.options ? initialValues.options.col : ''
    },
    type: initialValues ? initialValues.type : ''
  }
  const [selectedDb, setSelectedDb] = useState(formInitialValue && formInitialValue.db ? formInitialValue.db : "");
  const trackedCollections = useSelector(state => getTrackedCollections(state, selectedDb))

  const [value, setValue] = useState("");

  const handleSearch = value => setValue(value);
  const handleSelectDatabase = value => setSelectedDb(value)
  
  const handleSubmitClick = () => {
    form.validateFields().then((filterValues) => {
      handleSubmit(filterValues)
      handleCancel();
    });
  }

  return (
    <Modal
      title="Filter events"
      okText="Apply"
      visible={true}
      onCancel={handleCancel}
      onOk={handleSubmitClick}
      cancelButtonProps={{
        style: { float: "left" }, onClick: () => {
          handleSubmit()
          handleCancel()
        }
      }}
      cancelText="Reset Filters"
    >
      <Form layout="vertical" form={form} onFinish={handleSubmitClick} initialValues={formInitialValue}>
        <FormItemLabel name="Filter by event source" />
        <Form.Item name="source">
          <Select placeholder="Select event source">
            <Option value='database'>Database</Option>
            <Option value='file storage'>File storage</Option>
            <Option value='custom'>Custom</Option>
          </Select>
        </Form.Item>
        <ConditionalFormBlock dependency="source" condition={() => form.getFieldValue("source") === "database"}>
          <FormItemLabel name="Filter by table/collection" />
          <Input.Group compact>
            <Form.Item name={["options", "db"]}
              style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
              <AutoComplete placeholder="Select a database" onChange={handleSelectDatabase} options={dbList.map(db => ({ value: db }))} />
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
          <FormItemLabel name="Filter by trigger operation" />
          <Form.Item name="type">
            <Select placeholder="Select event trigger operation">
              <Option value="DB_INSERT">Insert</Option>
              <Option value="DB_UPDATE">Update</Option>
              <Option value="DB_DELETE">Delete</Option>
            </Select>
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="source" condition={() => form.getFieldValue("source") === "file storage"}>
          <FormItemLabel name="Filter by trigger operation" />
          <Form.Item name="type">
            <Select placeholder="Select event trigger operation">
              <Option value="FILE_CREATE">Write</Option>
              <Option value="FILE_DELETE">Delete</Option>
            </Select>
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="source" condition={() => form.getFieldValue("source") === "custom"}>
          <FormItemLabel name="Filter by type" />
          <Form.Item name="type">
            <Input placeholder="Custom event type (Example: my_custom_event_type)" defaultValue="" />
          </Form.Item>
        </ConditionalFormBlock>
      </Form>
    </Modal>
  );
}

export default FilterEvents;

