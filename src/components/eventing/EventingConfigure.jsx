import React, { useState } from 'react'
import { AutoComplete, Button, Form, Checkbox, Select, Input, DatePicker } from 'antd';
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import FormItemLabel from "../form-item-label/FormItemLabel";
import { useSelector } from 'react-redux';
import { getTrackedCollections } from '../../operations/database';
import { MinusCircleFilled, PlusOutlined } from '@ant-design/icons';

const { Option } = AutoComplete;

const EventingConfigure = ({ initialValues, handleSubmit, dbList, loading, onDeleteEventingLogs }) => {
  const [form] = Form.useForm()

  const [value, setValue] = useState("");
  const [selectedDbs, setSelectedDbs] = useState([]);
  const state = useSelector(state => state)

  const handleSearch = value => setValue(value);
  const handleSelectDatabases = values => setSelectedDbs([values])

  const handleTruncateEventLogs = () => {
    form.validateFields(["truncateSince"]).then(values => {
      values.truncateSince = values.truncateSince.unix()

      onDeleteEventingLogs(values.truncateSince)
    })
  }

  const getCollections = (db) => getTrackedCollections(state, db)

  const handleSubmitClick = e => {
    form.validateFields(["enabled", "dbAlias", "dbTables"]).then(values => {
      values = Object.assign({}, initialValues, values)

      if (values.enabled) {
        values.dbTablesInclusionMap = {}
        if (values.dbTables.length === 0) {
          values.dbTablesInclusionMap["*"] = "*";
        }
        else {
          values.dbTables.forEach(item => {
            if (item) {
              values.dbTablesInclusionMap[item.db] = item.col.length > 0 ? item.col : "*"
            }
          })
        }
      }

      delete values["dbTables"]
      handleSubmit(values)
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
        <Form.List name="dbTables">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field) => (
                  <Input.Group compact>
                    <Form.Item
                      name={[field.name, 'db']}
                      key={[field.name, 'db']}
                      style={{ flexGrow: 1, width: 200, marginRight: 10 }}
                    >
                      <AutoComplete placeholder="Select databases" onSelect={handleSelectDatabases}  >
                        {
                          dbList.map(db => (<AutoComplete.Option key={db} value={db}>{db}</AutoComplete.Option>))
                        }
                      </AutoComplete>
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'col']}
                      key={[field.name, 'col']}
                      style={{ flexGrow: 1, width: 200, marginRight: 10 }}
                      shouldUpdate
                    >
                      <Select mode="tags" placeholder="Collections / Tables" onSearch={handleSearch} >
                        {
                          getCollections(form.getFieldValue(["dbTables", field.name, 'db'])).filter(data => (data.toLowerCase().indexOf(value.toLowerCase()) !== -1)).map(data => (
                            <Option key={data} value={data}>
                              {data}
                            </Option>
                          ))
                        }
                      </Select>
                    </Form.Item>
                    <Form.Item>
                      <MinusCircleFilled onClick={() => remove(field.name)} style={{ fontSize: 20, cursor: "pointer" }} />
                    </Form.Item>
                  </Input.Group>
                ))}
                <Button style={{ marginBottom: "1em" }} onClick={() => add()}><PlusOutlined /> Add database</Button>
              </div>
            )
          }}
        </Form.List>
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