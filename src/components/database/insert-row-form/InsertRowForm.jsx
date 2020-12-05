import React, { useState } from 'react';
import { Form, Input, Button, Modal, Col, Row, Select, InputNumber, DatePicker, AutoComplete, Popconfirm, TimePicker } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import { generateId, notify } from '../../../utils';
import JSONCodeMirror from '../../json-code-mirror/JSONCodeMirror';

const InsertRowForm = (props) => {
  const [form] = Form.useForm();
  const [columnValue, setColumnValue] = useState("");

  const primitives = ["id", "string", "integer", "float", "boolean", "date", "time", "datetime", "json", "array"]

  const onFinish = () => {
    form.validateFields().then(values => {
      try {
        values.rows.forEach((val, index) => {
          if (val.datatype === "array") {
            values.rows[index].value = val.arrays ? val.arrays.map(el => el.value) : []
          }
          if (val.datatype === "json" || !primitives.includes(val.datatype)) {
            values.rows[index].value = JSON.parse(values.rows[index].value)
          }
        })
        props.insertRow(values.rows).then(() => props.handleCancel())
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    })
  };

  let initialRows = props.schema.map(val => {
    const dataType = val.type.toLowerCase();
    return {
      column: val.name,
      datatype: val.isArray ? "array" : !primitives.includes(dataType) ? "json" : dataType
    }
  });

  const isFieldRequired = (field) => {
    const column = form.getFieldValue(["rows", field, "column"]);
    const schema = props.schema.find(val => val.name === column);
    if (schema) {
      if (schema.type === "ID" || schema.hasCreatedAtDirective) {
        return { required: false }
      }
      else if (schema.isRequired) {
        return { required: true, message: 'Please enter value!' }
      }
    }
    return { required: false }
  }

  return (
    <Modal
      title='Add a row'
      okText='Apply'
      visible={props.visible}
      cancelText='Cancel'
      onCancel={props.handleCancel}
      onOk={onFinish}
      width={900}
    >
      <Form
        name='insert_row'
        form={form}
        initialValues={{
          rows: initialRows
        }}
      >
        <Form.List name='rows'>
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field, index) => (
                  <>
                    <Row key={field.key} gutter={10}>
                      <Col span={6}>
                        <Form.Item
                          name={[field.name, 'column']}
                          key={[field.name, 'column']}
                          style={{ display: 'inline-block', width: '100%' }}
                          rules={[
                            { required: true, message: 'Please enter column!' },
                          ]}
                        >
                          <AutoComplete
                            onSearch={(e) => setColumnValue(e)}
                            onFocus={e => setColumnValue(e.target.value)}
                            onBlur={(e) => {
                              const column = props.schema.find(val => val.name === e.target.value);
                              if (column) {
                                form.setFields([{ name: ["rows", field.name, "datatype"], value: column.type.toLowerCase() }])
                              }
                            }}
                            style={{ width: "100%" }}
                            placeholder="column"
                          >
                            {
                              props.schema.filter(data => (data.name.toLowerCase().indexOf(columnValue.toLowerCase()) !== -1)).map(data => (
                                <AutoComplete.Option key={data.name} value={data.name}>
                                  {data.name}
                                </AutoComplete.Option>
                              ))
                            }
                          </AutoComplete>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          name={[field.name, 'datatype']}
                          key={[field.name, 'datatype']}
                          style={{ display: 'inline-block', width: '100%' }}
                          rules={[
                            {
                              required: true,
                              message: 'Please select datatype!',
                            },
                          ]}
                        >
                          <Select
                            placeholder='Data type'
                            onChange={() => form.setFields([{ name: ["rows", field.name, "value"], value: null }])}
                          >
                            <Select.Option value='id'>ID</Select.Option>
                            <Select.Option value='string'>String</Select.Option>
                            <Select.Option value='integer'>Integer</Select.Option>
                            <Select.Option value='float'>Float</Select.Option>
                            <Select.Option value='boolean'>Boolean</Select.Option>
                            <Select.Option value='date'>Date</Select.Option>
                            <Select.Option value='time'>Time</Select.Option>
                            <Select.Option value='datetime'>Datetime</Select.Option>
                            <Select.Option value='json'>JSON/Object</Select.Option>
                            <Select.Option value='array'>Array</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "id"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <Input
                              placeholder='value'
                              suffix={
                                <Button type="link" onClick={() => {
                                  form.setFields([{ name: ["rows", field.name, "value"], value: generateId(17) }])
                                }}>Auto ID</Button>
                              }
                            />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "string"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <Input placeholder="value" />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "integer"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <InputNumber placeholder="value" style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "float"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <InputNumber placeholder="value" style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "boolean"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <Select placeholder="value">
                              <Select.Option value={true}>true</Select.Option>
                              <Select.Option value={false}>false</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "date"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <DatePicker style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "time"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <Input placeholder="Value" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "datetime"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <DatePicker showTime style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "json"}>
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <JSONCodeMirror style={{ border: '1px solid #D9D9D9' }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock
                        shouldUpdate={true}
                        condition={() => !primitives.includes(form.getFieldValue(["rows", field.name, "datatype"]))}
                      >
                        <Col span={10}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              isFieldRequired(field.name)
                            ]}
                          >
                            <JSONCodeMirror style={{ border: '1px solid #D9D9D9' }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <Col span={2}>
                        <Popconfirm
                          title="Are you sure delete this?"
                          onConfirm={() => remove(field.name)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <MinusCircleOutlined
                            style={{ margin: '0 8px' }}
                          />
                        </Popconfirm>
                      </Col>
                    </Row>
                    <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "array"}>
                      <Form.Item
                        name={[field.name, 'arrays']}
                        key={[field.name, 'arrays']}
                        style={{ display: 'inline-block', width: '100%' }}
                      >
                        <Form.List name={[field.name, "arrays"]}>
                          {(fields, { add, remove }) => {
                            return (
                              <div style={{ margin: "0px 60px 25px", padding: 16, border: '1px solid #E8E8E8' }}>
                                {fields.map((arrField, index) => (
                                  <>
                                    <Row key={arrField.key} gutter={10}>
                                      <Col span={8}>
                                        <Form.Item
                                          initialValue="string"
                                          name={[arrField.name, 'datatype']}
                                          key={[arrField.name, 'datatype']}
                                          style={{ display: 'inline-block', width: '100%' }}
                                          rules={[
                                            {
                                              required: true,
                                              message: 'Please select datatype!',
                                            },
                                          ]}
                                        >
                                          <Select placeholder='Data type'>
                                            <Select.Option value='id'>ID</Select.Option>
                                            <Select.Option value='string'>String</Select.Option>
                                            <Select.Option value='integer'>Integer</Select.Option>
                                            <Select.Option value='float'>Float</Select.Option>
                                            <Select.Option value='boolean'>Boolean</Select.Option>
                                            <Select.Option value='date'>Date</Select.Option>
                                            <Select.Option value='time'>Time</Select.Option>
                                            <Select.Option value='datetime'>Datetime</Select.Option>
                                          </Select>
                                        </Form.Item>
                                      </Col>
                                      <Col span={14}>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "id"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <Input
                                              placeholder='value'
                                              suffix={
                                                <Button type="link" onClick={() => {
                                                  form.setFields([{ name: ["rows", field.name, "arrays", arrField.name, "value"], value: generateId(17) }])
                                                }}>Auto ID</Button>
                                              }
                                            />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "string"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <Input placeholder="value" />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "integer"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <InputNumber placeholder="value" style={{ width: "100%" }} />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "float"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <InputNumber placeholder="value" style={{ width: "100%" }} />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "boolean"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <Select placeholder="value">
                                              <Select.Option value={true}>true</Select.Option>
                                              <Select.Option value={false}>false</Select.Option>
                                            </Select>
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "date"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <DatePicker />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "time"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <TimePicker />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "datetime"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <DatePicker showTime />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                      </Col>
                                      <Col span={2}>
                                        <Popconfirm
                                          title="Are you sure delete this?"
                                          onConfirm={() => remove(arrField.name)}
                                          okText="Yes"
                                          cancelText="No"
                                        >
                                          <MinusCircleOutlined
                                            style={{ margin: '0 8px' }}
                                          />
                                        </Popconfirm>
                                      </Col>
                                    </Row>
                                  </>

                                ))}
                                <Form.Item>
                                  <Button
                                    type='link'
                                    style={{
                                      padding: 0,
                                      marginTop: -10,
                                      color: 'rgba(0, 0, 0, 0.6)',
                                    }}
                                    onClick={() => {
                                      const fieldKeys = [
                                        ...fields.map(obj => ["rows", field.name, "arrays", obj.name, "datatype"]),
                                        ...fields.map(obj => ["rows", field.name, "arrays", obj.name, "value"])
                                      ]
                                      form.validateFields(fieldKeys)
                                        .then(() => add())
                                        .catch(ex => console.log("Exception", ex))
                                    }}
                                  >
                                    <span
                                      className='material-icons'
                                      style={{ position: 'relative', top: 5, marginRight: 5 }}
                                    >
                                      add_circle
                                </span>
                                Add field
                              </Button>
                                </Form.Item>
                              </div>
                            )
                          }}
                        </Form.List>
                      </Form.Item>
                    </ConditionalFormBlock>
                  </>
                ))}
                <Form.Item>
                  <Button
                    type='link'
                    style={{
                      padding: 0,
                      marginTop: -10,
                      color: 'rgba(0, 0, 0, 0.6)',
                    }}
                    onClick={() => {
                      const fieldKeys = [
                        ...fields.map(obj => ["rows", obj.name, "column"]),
                        ...fields.map(obj => ["rows", obj.name, "datatype"]),
                        ...fields.map(obj => ["rows", obj.name, "value"])
                      ]
                      form.validateFields(fieldKeys)
                        .then(() => add())
                        .catch(ex => console.log("Exception", ex))
                    }}
                  >
                    <span
                      className='material-icons'
                      style={{ position: 'relative', top: 5, marginRight: 5 }}
                    >
                      add_circle
                    </span>
                    Add field
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default InsertRowForm;
