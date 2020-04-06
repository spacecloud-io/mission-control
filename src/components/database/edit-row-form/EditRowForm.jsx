import React from 'react';
import './edit-row-modal.css';
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Button,
  Icon,
  Select,
  InputNumber,
  DatePicker,
} from 'antd';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import { generateId } from '../../../utils';

let rows = 1;
let arrays = 1;
const EditRowForm = (props) => {
  const {
    getFieldDecorator,
    getFieldValue,
    setFieldsValue,
  } = props.form;

  const handleSubmitClick = (e) => {
    if (e) e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        values.rows = values.rows.filter((val) => val);
        values.rows.forEach((val, index) => {
          if (val.datatype === 'array') {
            values.rows[index].value = val.arrays
              .filter((el) => el)
              .map((el) => el.value);
          }
          if (val.datatype === 'json') {
            values.rows[index].value = JSON.parse(val.value);
          }
        });
        props.EditRow(values.rows);
      }
    });
  };

  const defaultRules = { required: true, message: 'Please fill this field' };
  const initialKeys = [0];
  //ARRAYS
  const removeArray = (k) => {
    const arrayKeys = getFieldValue('arrayKeys');
    if (arrayKeys.length === 1) {
      return;
    }

    setFieldsValue({
      arrayKeys: arrayKeys.filter((key) => key !== k),
    });
  };

  const addArray = () => {
    const arrayKeys = getFieldValue('arrayKeys');
    const nextKeys = arrayKeys.concat(arrays++);
    setFieldsValue({
      arrayKeys: nextKeys,
    });
  };

  getFieldDecorator('arrayKeys', { initialValue: initialKeys });
  const arrayKeys = getFieldValue('arrayKeys');

  // ROWS
  const removeRow = (k) => {
    const rowKeys = getFieldValue('rowKeys');
    if (rowKeys.length === 1) {
      return;
    }

    setFieldsValue({
      rowKeys: rowKeys.filter((key) => key !== k),
    });
  };

  const rowAdd = () => {
    const rowKeys = getFieldValue('rowKeys');
    const nextKeys = rowKeys.concat(rows++);
    setFieldsValue({
      rowKeys: nextKeys,
    });
  };

  getFieldDecorator('rowKeys', { initialValue: initialKeys });
  const rowKeys = getFieldValue('rowKeys');
  const formItemsRows = rowKeys.map((k, index) => (
    <>
      <Row key={k} gutter={12}>
        <Col span={5}>
          <Form.Item style={{ display: 'inline-block' }}>
            {getFieldDecorator(`rows[${k}].column`, { rules: [defaultRules] })(
              <Input placeholder='column' />
            )}
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item style={{ display: 'inline-block', width: '100%' }}>
            {getFieldDecorator(`rows[${k}].operation`, {
              initialValue: 'set',
            })(
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
            )}
          </Form.Item>
        </Col>
        {
        getFieldValue(`rows[${k}].operation`) === 'rename' ? (
          <Col span={13}>
            {getFieldDecorator(`rows[${k}].value`, {
              rules: [defaultRules],
            })(<Input placeholder='value' />)}
          </Col>
        ) : (
          ''
        )}
        {getFieldValue(`rows[${k}].operation`) === 'inc' ||
        getFieldValue(`rows[${k}].operation`) === 'multiply' ||
        getFieldValue(`rows[${k}].operation`) === 'min' ||
        getFieldValue(`rows[${k}].operation`) === 'max' ? (
          <Col span={13}>
            {getFieldDecorator(`rows[${k}].value`, {
              rules: [defaultRules],
            })(<InputNumber style={{ width: '100%' }} placeholder='value' />)}
          </Col>
        ) : (
          ''
        )}
        {getFieldValue(`rows[${k}].operation`) === 'set' ||
        getFieldValue(`rows[${k}].operation`) === 'push' ? (
          <>
            <Col span={5}>
              <Form.Item style={{ display: 'inline-block', width: '100%' }}>
                {getFieldDecorator(`rows[${k}].datatype`, {
                  initialValue: 'string',
                })(
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
                )}
              </Form.Item>
            </Col>
            {getFieldValue(`rows[${k}].datatype`) !== 'array' && (
              <Col span={8}>
                <Form.Item
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    border:
                      getFieldValue(`rows[${k}].datatype`) === 'json'
                        ? '1px solid #D9D9D9'
                        : '',
                  }}
                >
                  {getFieldValue(`rows[${k}].datatype`) === 'id' &&
                    getFieldDecorator(`rows[${k}].value`, {
                      rules: [defaultRules],
                    })(
                      <Input
                        placeholder='value'
                        suffix={
                          <Button
                            type='link'
                            onClick={() => {
                              const field = `rows[${k}].value`;
                              setFieldsValue({ [field]: generateId(17) });
                            }}
                          >
                            Auto ID
                          </Button>
                        }
                      />
                    )}
                  {getFieldValue(`rows[${k}].datatype`) === 'string' &&
                    getFieldDecorator(`rows[${k}].value`, {
                      rules: [defaultRules],
                    })(<Input placeholder='value' />)}
                  {getFieldValue(`rows[${k}].datatype`) === 'integer' &&
                    getFieldDecorator(`rows[${k}].value`, {
                      rules: [defaultRules],
                    })(
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder='value'
                      />
                    )}
                  {getFieldValue(`rows[${k}].datatype`) === 'float' &&
                    getFieldDecorator(`rows[${k}].value`, {
                      rules: [defaultRules],
                    })(
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder='value'
                      />
                    )}
                  {getFieldValue(`rows[${k}].datatype`) === 'boolean' &&
                    getFieldDecorator(`rows[${k}].value`, {
                      initialValue: true,
                    })(
                      <Select>
                        <Select.Option value={true}>true</Select.Option>
                        <Select.Option value={false}>false</Select.Option>
                      </Select>
                    )}
                  {getFieldValue(`rows[${k}].datatype`) === 'datetime' &&
                    getFieldDecorator(`rows[${k}].value`, {
                      rules: [defaultRules],
                    })(<DatePicker showTime />)}
                  {getFieldValue(`rows[${k}].datatype`) === 'json' && (
                    <>
                      {getFieldDecorator(`rows[${k}].value`, {
                        initialValue: '{}',
                      })}
                      <CodeMirror
                        value={getFieldValue(`rows[${k}].value`)}
                        style={{ width: '100%', border: '1px solid #D9D9D9' }}
                        options={{
                          mode: { name: 'javascript', json: true },
                          lineNumbers: true,
                          styleActiveLine: true,
                          matchBrackets: true,
                          autoCloseBrackets: true,
                          tabSize: 2,
                          autofocus: true,
                        }}
                        onBeforeChange={(editor, data, value) => {
                          const key = `rows[${k}].value`;
                          setFieldsValue({
                            [key]: value,
                          });
                        }}
                      />
                    </>
                  )}
                </Form.Item>
              </Col>
            )}
          </>
        ) : (
          ''
        )}
        <Col span={1}>
          {index !== rowKeys.length - 1 && (
            <Button
              type='link'
              style={{ color: 'black', padding: 0 }}
              onClick={() => removeRow(k)}
            >
              <Icon type='close' />
            </Button>
          )}
        </Col>
      </Row>
      {getFieldValue(`rows[${k}].datatype`) === 'array' && (
        <div
          style={{
            margin: '0px 60px 25px',
            padding: 16,
            border: '1px solid #E8E8E8',
          }}
        >
          {arrayKeys.map((n, index) => (
            <Row key={n} gutter={16}>
              <Col span={7}>
                <Form.Item style={{ display: 'inline-block', width: '100%' }}>
                  {getFieldDecorator(`rows[${k}].arrays[${n}].datatype`, {
                    initialValue: 'string',
                  })(
                    <Select placeholder='datatype'>
                      <Select.Option value='id'>ID</Select.Option>
                      <Select.Option value='string'>String</Select.Option>
                      <Select.Option value='integer'>Integer</Select.Option>
                      <Select.Option value='float'>Float</Select.Option>
                      <Select.Option value='boolean'>Boolean</Select.Option>
                      <Select.Option value='datetime'>Datetime</Select.Option>
                    </Select>
                  )}
                </Form.Item>
                <br />
                {index === arrayKeys.length - 1 && (
                  <Button
                    type='link'
                    onClick={() => addArray()}
                    style={{
                      padding: 0,
                      marginTop: -10,
                      color: 'rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    <span
                      class='material-icons'
                      style={{ position: 'relative', top: 5, marginRight: 5 }}
                    >
                      add_circle
                    </span>
                    Add field
                  </Button>
                )}
              </Col>
              <Col span={12}>
                <Form.Item
                  style={{
                    display: 'inline-block',
                    width: '100%',
                  }}
                >
                  {getFieldValue(`rows[${k}].arrays[${n}].datatype`) === 'id' &&
                    getFieldDecorator(`rows[${k}].arrays[${n}].value`, {
                      rules: [defaultRules],
                    })(<Input placeholder='value' />)}
                  {getFieldValue(`rows[${k}].arrays[${n}].datatype`) ===
                    'string' &&
                    getFieldDecorator(`rows[${k}].arrays[${n}].value`, {
                      rules: [defaultRules],
                    })(<Input placeholder='value' />)}
                  {getFieldValue(`rows[${k}].arrays[${n}].datatype`) ===
                    'integer' &&
                    getFieldDecorator(`rows[${k}].arrays[${n}].value`, {
                      rules: [defaultRules],
                    })(
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder='value'
                      />
                    )}
                  {getFieldValue(`rows[${k}].arrays[${n}].datatype`) ===
                    'float' &&
                    getFieldDecorator(`rows[${k}].arrays[${n}].value`, {
                      rules: [defaultRules],
                    })(
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder='value'
                      />
                    )}
                  {getFieldValue(`rows[${k}].arrays[${n}].datatype`) ===
                    'boolean' &&
                    getFieldDecorator(`rows[${k}].arrays[${n}].value`, {
                      initialValue: true,
                    })(
                      <Select>
                        <Select.Option value={true}>true</Select.Option>
                        <Select.Option value={false}>false</Select.Option>
                      </Select>
                    )}
                  {getFieldValue(`rows[${k}].arrays[${n}].datatype`) ===
                    'datetime' &&
                    getFieldDecorator(
                      `rows[${k}].arrays[${n}].value`,
                      {}
                    )(<DatePicker showTime />)}
                </Form.Item>
              </Col>
              <Col span={3}>
                {index !== arrayKeys.length - 1 && (
                  <Button
                    type='link'
                    style={{ color: 'black' }}
                    onClick={() => removeArray(n)}
                  >
                    <Icon type='close' />
                  </Button>
                )}
              </Col>
            </Row>
          ))}
        </div>
      )}
      {index === rowKeys.length - 1 && (
        <Button
          type='link'
          onClick={() => rowAdd()}
          style={{
            padding: 0,
            marginTop: -10,
            color: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <span
            class='material-icons'
            style={{ position: 'relative', top: 5, marginRight: 5 }}
          >
            add_circle
          </span>
          Add field
        </Button>
      )}
    </>
  ));

  return (
    <Modal
      title="Update a row's value"
      okText='Save'
      visible={props.visible}
      cancelText='Cancel'
      onCancel={props.handleCancel}
      onOk={handleSubmitClick}
      className='edit-row-modal'
    >
      <Form layout='vertical' onSubmit={handleSubmitClick}>
        <FormItemLabel name='Row' />
        {formItemsRows}
      </Form>
    </Modal>
  );
};

export default Form.create({})(EditRowForm);
