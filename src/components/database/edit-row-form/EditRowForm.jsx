import React, {useState} from 'react';
import { Form, Input, Button, Modal, Col, Row, Select, InputNumber, DatePicker } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import {generateId} from '../../../utils';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';

const jsoncode = [];
const EditRowForm = (props) => {
  const [form] = Form.useForm();
  const [counter, setCounter] = useState(0);
  const onFinish = () => {
    form.validateFields().then(values => {
      values.rows.forEach((val, index) => {
        if(val.datatype === "array") {
          values.rows[index].value = val.arrays.map(el => el.value);
        }
        if(val.datatype === "json") {
          values.rows[index].value = JSON.parse(jsoncode[index])
        }
      })
      props.EditRow(values.rows);
    })
  };

  return (
    <Modal
      title="Update row's value"
      okText='Apply'
      visible={props.visible}
      cancelText='Cancel'
      onCancel={props.handleCancel}
      onOk={onFinish}
      className='filter-sorter-modal'
    >
      <Form name='edit_row' form={form}>
        <Form.List name='rows'>
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
                        style={{ display: 'inline-block' }}
                        rules={[
                          { required: true, message: 'Please enter column!' },
                        ]}
                      >
                        <Input placeholder='column' />
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
                          <Select.Option value='set'>Set</Select.Option>
                          {props.selectedDB === "mongo" && (
                          <Select.Option value='unset'>Unset</Select.Option>
                          )}
                          {props.selectedDB === "mongo" && (
                          <Select.Option value='rename'>Rename</Select.Option>
                          )}
                          <Select.Option value='inc'>Increment</Select.Option>
                          <Select.Option value='multiply'>Multiply</Select.Option>
                          <Select.Option value='min'>Min</Select.Option>
                          <Select.Option value='max'>Max</Select.Option>
                          <Select.Option value='currentDate'>Current Date</Select.Option>
                          <Select.Option value='currentTimestamp'>
                            Current Timestamp
                          </Select.Option>
                          {props.selectedDB === "mongo" && (
                          <Select.Option value='push'>Push</Select.Option>
                          )}
                        </Select>
                      </Form.Item>
                    </Col>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "operation"]) === "rename"}>
                      <Col span={12}>
                        <Form.Item
                          name={[field.name, 'value']}
                          key={[field.name, 'value']}
                          style={{ display: 'inline-block', width: '100%' }}
                          rules={[
                            { required: true, message: 'Please enter value!' },
                          ]}
                        >
                          <Input placeholder='value' />
                        </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock 
                        shouldUpdate={true} 
                        condition={() => 
                          form.getFieldValue(["rows", field.name, "operation"]) === "inc" || 
                          form.getFieldValue(["rows", field.name, "operation"]) === "multiply" ||
                          form.getFieldValue(["rows", field.name, "operation"]) === "min" ||
                          form.getFieldValue(["rows", field.name, "operation"]) === "max"
                        }
                      >
                        <Col span={12}>
                        <Form.Item
                          name={[field.name, 'value']}
                          key={[field.name, 'value']}
                          style={{ display: 'inline-block', width: '100%' }}
                          rules={[
                            { required: true, message: 'Please enter value!' },
                          ]}
                        >
                          <InputNumber style={{ width: '100%' }} placeholder='value' />
                        </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                    <ConditionalFormBlock 
                        shouldUpdate={true} 
                        condition={() => 
                        form.getFieldValue(["rows", field.name, "operation"]) === "set" || 
                        form.getFieldValue(["rows", field.name, "operation"]) === "push"
                      }
                    >
                      <>
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
                        <Select placeholder='datatype'>
                          <Select.Option value='id'>ID</Select.Option>
                          <Select.Option value='string'>String</Select.Option>
                          <Select.Option value='integer'>Integer</Select.Option>
                          <Select.Option value='float'>Float</Select.Option>
                          <Select.Option value='boolean'>Boolean</Select.Option>
                          <Select.Option value='datetime'>Datetime</Select.Option>
                          <Select.Option value='json'>json/object</Select.Option>
                          <Select.Option value='array'>Array</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "id"}>
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
                                form.setFields([{name: ["rows", field.name, "value"], value: generateId(17)}])
                              }}>Auto ID</Button>
                            }
                          />
                        </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "string"}>
                      <Col span={7}>
                        <Form.Item
                          name={[field.name, 'value']}
                          key={[field.name, 'value']}
                          style={{ display: 'inline-block', width: '100%' }}
                          rules={[
                            { required: true, message: 'Please enter value!' },
                          ]}
                        >
                          <Input placeholder="value"/>
                        </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "integer"}>
                      <Col span={7}>
                        <Form.Item
                          name={[field.name, 'value']}
                          key={[field.name, 'value']}
                          style={{ display: 'inline-block', width: '100%' }}
                          rules={[
                            { required: true, message: 'Please enter value!' },
                          ]}
                        >
                          <InputNumber placeholder="value" style={{width: "100%"}}/>
                        </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "float"}>
                      <Col span={7}>
                        <Form.Item
                          name={[field.name, 'value']}
                          key={[field.name, 'value']}
                          style={{ display: 'inline-block', width: '100%' }}
                          rules={[
                            { required: true, message: 'Please enter value!' },
                          ]}
                        >
                          <InputNumber placeholder="value" style={{width: "100%"}}/>
                        </Form.Item>
                        </Col>
                      </ConditionalFormBlock>
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "boolean"}>
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
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "datetime"}>
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
                      <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "json"}>
                      <Col span={7} style={{border: '1px solid #D9D9D9', marginBottom: 15}}>
                          <CodeMirror
                           value={jsoncode[field.name] ? jsoncode[field.name] : ""}
                           options={{
                             mode: { name: 'javascript', json: true },
                             lineNumbers: true,
                             styleActiveLine: true,
                             matchBrackets: true,
                             autoCloseBrackets: true,
                             tabSize: 2,
                             autofocus: true
                           }}
                           onBeforeChange={(editor, data, value) => {                                                 
                              jsoncode[field.name] = value;                           
                             setCounter(counter+1);
                           }}
                         />
                        </Col>
                      </ConditionalFormBlock>
                    </>
                    </ConditionalFormBlock>
                    <Col span={2}>
                      <MinusCircleOutlined
                        style={{ margin: '0 8px' }}
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    </Col>
                  </Row>
                  <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["rows", field.name, "datatype"]) === "array"}>
                  <Form.Item
                    name={[field.name, 'arrays']}
                    key={[field.name, 'arrays']}
                    style={{ display: 'inline-block', width: '100%' }}
                  >
                    <Form.List name={[field.name, "arrays"]}>
                      {(fields, {add, remove}) => {
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
                                    <Select.Option value='datetime'>Datetime</Select.Option>
                                    <Select.Option value='json'>json/object</Select.Option>
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
                                          form.setFields([{name: ["rows", field.name, "arrays", arrField.name, "value"], value: generateId(17)}])
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
                                    <Input placeholder="value"/>
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
                                   <InputNumber placeholder="value" style={{width: "100%"}}/>
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
                                    <InputNumber placeholder="value" style={{width: "100%"}}/>
                                  </Form.Item>
                                </ConditionalFormBlock>
                                <ConditionalFormBlock 
                                 shouldUpdate={true} 
                                 condition={() => form.getFieldValue(["rows", field.name, "arrays", arrField.name, "datatype"]) === "boolean"}
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
                                <MinusCircleOutlined
                                  style={{ margin: '0 8px' }}
                                  onClick={() => {
                                    remove(arrField.name);
                                  }}
                                />
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
                                  ...fields.map(obj => ["rows", field.name, "arrays", obj.name,"datatype"]),
                                  ...fields.map(obj => ["rows", field.name, "arrays", obj.name,"value"])
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
                        ...fields.map(obj => ["rows", obj.name,"column"]),
                        ...fields.map(obj => ["rows", obj.name,"operation"]),
                        ...fields.map(obj => ["rows", obj.name,"value"])
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

export default EditRowForm;
