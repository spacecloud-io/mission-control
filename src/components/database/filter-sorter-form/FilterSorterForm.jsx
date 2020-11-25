import React, { useState } from 'react';
import { Form, Input, Button, Modal, Col, Row, Select, InputNumber, DatePicker, AutoComplete, Popconfirm } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import { generateId, notify } from '../../../utils';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { useDispatch, useSelector } from 'react-redux';
import { reset } from 'automate-redux';
import JSONCodeMirror from '../../json-code-mirror/JSONCodeMirror';

const FilterSorterForm = (props) => {
  const [form] = Form.useForm();
  const [columnValue, setColumnValue] = useState("");

  const primitives = ["id", "string", "integer", "float", "boolean", "date", "time", "datetime", "json", "array"]

  const filters = useSelector(state => state.uiState.explorer.filters)
    .map(obj => Object.assign({}, obj, { value: obj.datatype === "json" ? JSON.stringify(obj.value, null, 2) : obj.value }))
  const sorters = useSelector(state => state.uiState.explorer.sorters);
  const dispatch = useDispatch();
  const onFinish = () => {
    form.validateFields().then(values => {
      try {
        values.filters.forEach((val, index) => {
          if (val.datatype === "array") {
            values.filters[index].value = val.arrays ? val.arrays.map(el => el.value) : [];
          }
          if (val.datatype === "json" || !primitives.includes(val.datatype)) {
            values.filters[index].value = JSON.parse(values.filters[index].value);
          }
        })
        props.filterTable(values)
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    })
  };

  return (
    <Modal
      title='Filter and sort query results'
      okText='Apply'
      visible={props.visible}
      cancelButtonProps={{
        style: { float: 'left' },
        onClick: () => {
          dispatch(reset('uiState.explorer.sorters'));
          dispatch(reset('uiState.explorer.filters'));
          form.resetFields();
          props.handleCancel();
        }
      }}
      cancelText='Reset filters & sorters'
      onCancel={props.handleCancel}
      onOk={onFinish}
      width={900}
    >
      <Form
        name='insert_row'
        form={form}
        initialValues={{
          filters: filters,
          sorters: sorters
        }}
      >
        <FormItemLabel name="Filter" />
        <Form.List name='filters'>
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field, index) => (
                  <>
                    <Row key={field.key} gutter={10}>
                      <Col span={5}>
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
                                const columnDataType = column.type.toLowerCase()
                                form.setFields([{ name: ["filters", field.name, "datatype"], value: column.isArray ? 'array' : (!primitives.includes(columnDataType) ? "json" : columnDataType) }])
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
                      <Col span={5}>
                        <Form.Item
                          name={[field.name, 'operation']}
                          key={[field.name, 'operation']}
                          style={{ display: 'inline-block', width: '100%' }}
                          rules={[
                            {
                              required: true,
                              message: 'Please select operation!',
                            },
                          ]}
                        >
                          <Select placeholder='operation'>
                            <Select.Option value='=='>Equals to</Select.Option>
                            <Select.Option value='!='>Not equals to</Select.Option>
                            <Select.Option value='>'>Greater than</Select.Option>
                            <Select.Option value='<'>Less than</Select.Option>
                            <Select.Option value='>='>Greater than equal to</Select.Option>
                            <Select.Option value='<='>Less than equal to</Select.Option>
                            <Select.Option value='in'>In</Select.Option>
                            <Select.Option value='nin'>Not In</Select.Option>
                            <Select.Option value='regex'>Regex</Select.Option>
                            <Select.Option value='contains'>Contains</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          initialValue="string"
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
                            onChange={() => form.setFields([{ name: ["filters", field.name, "value"], value: null }])}
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
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "id"}>
                        <Col span={7}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
                            ]}
                          >
                            <Input
                              placeholder='value'
                              suffix={
                                <Button type="link" onClick={() => {
                                  form.setFields([{ name: ["filters", field.name, "value"], value: generateId(17) }])
                                }}>Auto ID</Button>
                              }
                            />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "string"}>
                        <Col span={7}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
                            ]}
                          >
                            <Input placeholder="value" />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "integer"}>
                        <Col span={7}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
                            ]}
                          >
                            <InputNumber placeholder="value" style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "float"}>
                        <Col span={7}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
                            ]}
                          >
                            <InputNumber placeholder="value" style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "boolean"}>
                        <Col span={7}>
                          <Form.Item
                            initialValue={true}
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
                            ]}
                          >
                            <Select>
                              <Select.Option value={true}>true</Select.Option>
                              <Select.Option value={false}>false</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "date"}>
                        <Col span={7}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
                            ]}
                          >
                            <DatePicker />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "time"}>
                        <Col span={7}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
                            ]}
                          >
                            <Input placeholder="Value" />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "datetime"}>
                        <Col span={7}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
                            ]}
                          >
                            <DatePicker showTime />
                          </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "json"}>
                        <Col span={7}>
                          <Form.Item
                            name={[field.name, 'value']}
                            key={[field.name, 'value']}
                            style={{ display: 'inline-block', width: '100%' }}
                            rules={[
                              { required: true, message: 'Please enter value!' },
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
                    <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["filters", field.name, "datatype"]) === "array"}>
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
                                          <Select placeholder='datatype'>
                                            <Select.Option value='id'>ID</Select.Option>
                                            <Select.Option value='string'>String</Select.Option>
                                            <Select.Option value='integer'>Integer</Select.Option>
                                            <Select.Option value='float'>Float</Select.Option>
                                            <Select.Option value='boolean'>Boolean</Select.Option>
                                            <Select.Option value='date'>Date</Select.Option>
                                            <Select.Option value='time'>Time</Select.Option>
                                            <Select.Option value='datetime'>Datetime</Select.Option>
                                            <Select.Option value='json'>JSON/Object</Select.Option>
                                          </Select>
                                        </Form.Item>
                                      </Col>
                                      <Col span={14}>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["filters", field.name, "arrays", arrField.name, "datatype"]) === "id"}
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
                                                  form.setFields([{ name: ["filters", field.name, "arrays", arrField.name, "value"], value: generateId(17) }])
                                                }}>Auto ID</Button>
                                              }
                                            />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["filters", field.name, "arrays", arrField.name, "datatype"]) === "string"}
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
                                          condition={() => form.getFieldValue(["filters", field.name, "arrays", arrField.name, "datatype"]) === "integer"}
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
                                          condition={() => form.getFieldValue(["filters", field.name, "arrays", arrField.name, "datatype"]) === "float"}
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
                                          condition={() => form.getFieldValue(["filters", field.name, "arrays", arrField.name, "datatype"]) === "boolean"}
                                        >
                                          <Form.Item
                                            initialValue={true}
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <Select>
                                              <Select.Option value={true}>true</Select.Option>
                                              <Select.Option value={false}>false</Select.Option>
                                            </Select>
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["filters", field.name, "arrays", arrField.name, "datatype"]) === "date"}
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
                                          condition={() => form.getFieldValue(["filters", field.name, "arrays", arrField.name, "datatype"]) === "time"}
                                        >
                                          <Form.Item
                                            name={[arrField.name, 'value']}
                                            key={[arrField.name, 'value']}
                                            style={{ display: 'inline-block', width: '100%' }}
                                            rules={[
                                              { required: true, message: 'Please enter value!' },
                                            ]}
                                          >
                                            <Input placeholder="Value" />
                                          </Form.Item>
                                        </ConditionalFormBlock>
                                        <ConditionalFormBlock
                                          shouldUpdate={true}
                                          condition={() => form.getFieldValue(["filters", field.name, "arrays", arrField.name, "datatype"]) === "datetime"}
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
                                        ...fields.map(obj => ["filters", field.name, "arrays", obj.name, "datatype"]),
                                        ...fields.map(obj => ["filters", field.name, "arrays", obj.name, "value"])
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
                        ...fields.map(obj => ["filters", obj.name, "column"]),
                        ...fields.map(obj => ["filters", obj.name, "operation"]),
                        ...fields.map(obj => ["filters", obj.name, "value"])
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
        <FormItemLabel name="Sort" />
        <Form.List name='sorters'>
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field, index) => (
                  <Row key={field.key} gutter={10}>
                    <Col span={7}>
                      <Form.Item
                        name={[field.name, 'column']}
                        key={[field.name, 'column']}
                        style={{ display: 'inline-block', width: "100%" }}
                        rules={[
                          { required: true, message: 'Please enter column!' },
                        ]}
                      >
                        <AutoComplete
                          style={{ width: "100%" }}
                          placeholder="column"
                          dataSource={props.schema.map(val => val.name)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item
                        name={[field.name, 'order']}
                        key={[field.name, 'order']}
                        style={{ display: 'inline-block', width: '100%' }}
                        rules={[
                          {
                            required: true,
                            message: 'Please select order!',
                          },
                        ]}
                      >
                        <Select placeholder='order'>
                          <Select.Option value='ascending'>Ascending</Select.Option>
                          <Select.Option value='descending'>Descending</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
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
                        ...fields.map(obj => ["sorters", obj.name, "column"]),
                        ...fields.map(obj => ["sorters", obj.name, "order"])
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

export default FilterSorterForm;
