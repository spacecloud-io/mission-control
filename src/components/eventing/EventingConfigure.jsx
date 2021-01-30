import React, { useState } from 'react'
import { AutoComplete, Button, Form, Checkbox, Select, Input, DatePicker } from 'antd';
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import FormItemLabel from "../form-item-label/FormItemLabel";
import { useSelector } from 'react-redux';
import { getTrackedCollections } from '../../operations/database';

const { Option } = AutoComplete;

const EventingConfigure = ({ initialValues, handleSubmit, dbList, loading, onDeleteEventingLogs }) => {
  const [form] = Form.useForm()

  const [value, setValue] = useState("");
  const [selectedDbs, setSelectedDbs] = useState([]);
  const trackedCollections = useSelector(state => {
    const allTrackedCollections = selectedDbs.reduce((prev, curr) => [...prev, ...getTrackedCollections(state, curr)], [])
    return [...new Set(allTrackedCollections)]
  })

  const handleSearch = value => setValue(value);
  const handleSelectDatabases = values => setSelectedDbs(values)

  const handleTruncateEventLogs = () => {
    form.validateFields(["truncateSince"]).then(values => {
      values.truncateSince = values.truncateSince.unix()
      
      onDeleteEventingLogs(values.truncateSince)
    })
  }
  const handleSubmitClick = e => {
    form.validateFields(["dbAlias", "db", "col"]).then(values => {
      values = Object.assign({}, initialValues, values)

      if (values.enabled) {
        values.dbTablesInclusionMap = {}
        if (!values.db) {
          values.dbTablesInclusionMap["*"] = "*";
        }
        else {
          values.db.forEach(item => {
            if (item == values.dbAlias) {
              values.dbTablesInclusionMap[item] = values.col ? values.col : "*";
              return;
            }
            values.dbTablesInclusionMap[item] = values.col ? [] : "*";
          })
        }
      }

      delete values["db"]
      delete values["col"]
      // handleSubmit(values)
      console.log(values)
    })
  }

  if (!loading) {
    form.setFieldsValue(initialValues)
  }

  return (
    <Form form={form} >
      <Form.Item name="enabled" valuePropName="checked">
        <Checkbox>
          Enable eventing module
        </Checkbox>
      </Form.Item>
      <ConditionalFormBlock dependency="enabled" condition={() => form.getFieldValue("enabled")}>
        <FormItemLabel name="Eventing DB" description="The database to store event invocation logs" />
        <Form.Item name="dbAlias" rules={[{ required: true, message: 'Database is required!' }]}>
          <AutoComplete placeholder="Choose an eventing database" style={{ width: 320 }} options={dbList.map(db => ({ value: db }))} />
        </Form.Item>
        <FormItemLabel name="Disabling eventing" description="Select the database & table on which the eventing has to be disabled" />
        <Input.Group compact>
          <Form.Item name="db" style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
            <Select mode="tags" placeholder="Select databases" onSearch={handleSearch} onChange={handleSelectDatabases}  >
              {
                dbList.map(db => (<Option key={db} value={db}>{db}</Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item name="col" style={{ flexGrow: 1, width: 200 }} >
            <Select mode="tags" placeholder="Collections / Tables" onSearch={handleSearch} >
              {
                trackedCollections.filter(data => (data.toLowerCase().indexOf(value.toLowerCase()) !== -1)).map(data => (
                  <Option key={data} value={data}>
                    {data}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
        </Input.Group>
      </ConditionalFormBlock>
      <Form.Item>
        <Button onClick={handleSubmitClick} >
          Save
				</Button>
      </Form.Item>
      <ConditionalFormBlock dependency="enabled" condition={() => form.getFieldValue("enabled")}>
        <FormItemLabel name="Truncate event logs" description="Delete the event logs from a specific timestamp to clear/save database storage" />
        <Form.Item name="truncateSince" rules={[{ required: true, message: "No date selected!" }]}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Button type="primary" danger onClick={handleTruncateEventLogs}>Delete</Button>
      </ConditionalFormBlock>
    </Form>
  )
}

export default EventingConfigure;