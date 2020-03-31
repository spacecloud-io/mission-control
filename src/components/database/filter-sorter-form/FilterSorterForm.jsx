import React, { useEffect, useState } from 'react';
import './filter-sorter-form.css';
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
  DatePicker
} from 'antd';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import { useSelector, useDispatch } from 'react-redux';
import { reset } from 'automate-redux';
import moment from 'moment';

let filters = 0;
let sorters = 0;
const defaultRules = { required: true, message: 'Please fill this field' };

const ArrayForm = ({ k, form, initialArrays }) => {
  console.log(initialArrays)
  const [arrays, incArrays] = useState(initialArrays.length+1);

  const { getFieldDecorator, getFieldValue, setFieldsValue } = form;

  const initialArrayKeys = [0];
  if(initialArrays.length > 0){
    for(let i = 1; i <initialArrays.length; i++){
      initialArrayKeys.push(i);
    }
  }

  const removeArray = i => {
    const arrayKeys = getFieldValue(`arrayKeys${k}`);
    if (arrayKeys.length === 1) {
      return;
    }
    const field = `arrayKeys${k}`;
    setFieldsValue({
      [field]: arrayKeys.filter(key => key !== i)
    });
  };

  const addArray = () => {
    const arrayKeys = getFieldValue(`arrayKeys${k}`);
    incArrays(arrays + 1);
    const nextKeys = arrayKeys.concat(arrays);
    const field = `arrayKeys${k}`;
    setFieldsValue({
      [field]: nextKeys
    });
  };

  getFieldDecorator(`arrayKeys${k}`, { initialValue: initialArrayKeys });
  const arrayKeys = getFieldValue(`arrayKeys${k}`);

  return (
    <>
      {arrayKeys.map((n, index) => (
        <Row key={n} gutter={16}>
          <Col span={7}>
            <Form.Item style={{ display: 'inline-block', width: '100%' }}>
              {getFieldDecorator(`filters[${k}].arrays[${n}].datatype`, {
                initialValue: initialArrays[n] ? initialArrays[n].datatype : "string"
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
                  color: 'rgba(0, 0, 0, 0.6)'
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
            )}
          </Col>
          <Col span={12}>
            <Form.Item
              style={{
                display: 'inline-block',
                width: '100%'
              }}
            >
              {getFieldValue(`filters[${k}].arrays[${n}].datatype`) === 'id' &&
                getFieldDecorator(`filters[${k}].arrays[${n}].value`, {
                  initialValue: initialArrays[n] ? initialArrays[n].value : undefined,
                  rules: [defaultRules]
                })(<Input placeholder='value' />)}
              {getFieldValue(`filters[${k}].arrays[${n}].datatype`) ===
                'string' &&
                getFieldDecorator(`filters[${k}].arrays[${n}].value`, {
                  initialValue: initialArrays[n] ? initialArrays[n].value : undefined,
                  rules: [defaultRules]
                })(<Input placeholder='value' />)}
              {getFieldValue(`filters[${k}].arrays[${n}].datatype`) ===
                'integer' &&
                getFieldDecorator(`filters[${k}].arrays[${n}].value`, {
                  initialValue: initialArrays[n] ? initialArrays[n].value : undefined,
                  rules: [defaultRules]
                })(
                  <InputNumber style={{ width: '100%' }} placeholder='value' />
                )}
              {getFieldValue(`filters[${k}].arrays[${n}].datatype`) ===
                'float' &&
                getFieldDecorator(`filters[${k}].arrays[${n}].value`, {
                  initialValue: initialArrays[n] ? initialArrays[n].value : undefined,
                  rules: [defaultRules]
                })(
                  <InputNumber style={{ width: '100%' }} placeholder='value' />
                )}
              {getFieldValue(`filters[${k}].arrays[${n}].datatype`) ===
                'boolean' &&
                getFieldDecorator(`filters[${k}].arrays[${n}].value`, {
                  initialValue: initialArrays[n] ? initialArrays[n].value : true,
                })(
                  <Select>
                    <Select.Option value={true}>true</Select.Option>
                    <Select.Option value={false}>false</Select.Option>
                  </Select>
                )}
              {getFieldValue(`filters[${k}].arrays[${n}].datatype`) ===
                'datetime' &&
                getFieldDecorator(
                  `filters[${k}].arrays[${n}].value`,
                  {initialValue: initialArrays[n] ? initialArrays[n].value : moment()}
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
    </>
  );
};

const FilterSorterForm = props => {
  const dispatch = useDispatch();

  const initialFilters = useSelector(state => state.uiState.explorer.filters);
  const initialSorters = useSelector(state => state.uiState.explorer.sorters);

  const {
    getFieldDecorator,
    getFieldValue,
    setFieldsValue,
    resetFields
  } = props.form;

  useEffect(() => {
    sorters = initialSorters.length;
    filters = initialFilters.length;
  }, []);

  const handleSubmitClick = e => {
    if (e) e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        if (values.filters) {
          values.filters = values.filters.filter(val => val);

          values.filters.forEach((val, index) => {
            if (val.datatype === 'array') {
              values.filters[index].arrays = val.arrays.filter(el => el);
              values.filters[index].value = val.arrays.map(el => el.value);
            }

            if (val.datatype === 'json') {
              values.filters[index].value = JSON.parse(val.value);
            }
          });
        }

        if (values.sorters) {
          values.sorters = values.sorters.filter(val => val);
        }
        props.filterTable({
          filters: values.filters ? values.filters : [],
          sorters: values.sorters ? values.sorters : []
        });
      }
    });
  };

  // FILTERS
  let initialFilterKeys = [];
  if (initialFilters.length > 0) {
    for (let i = 0; i < initialFilters.length; i++) {
      initialFilterKeys.push(i);
    }
  }

  const removeFilter = k => {
    const filterKeys = getFieldValue('filterKeys');
    setFieldsValue({
      filterKeys: filterKeys.filter(key => key !== k)
    });
  };

  const filterAdd = () => {
    const filterKeys = getFieldValue('filterKeys');
    const nextKeys = filterKeys.concat(filters++);
    setFieldsValue({
      filterKeys: nextKeys
    });
  };

  getFieldDecorator('filterKeys', { initialValue: initialFilterKeys });
  const filterKeys = getFieldValue('filterKeys');
  const formItemsFilters = filterKeys.map(k => (
    <>
      <Row key={k} gutter={16}>
        <Col span={5}>
          <Form.Item style={{ display: 'inline-block' }}>
            {getFieldDecorator(`filters[${k}].column`, {
              initialValue: initialFilters[k]
                ? initialFilters[k].column
                : undefined,
              rules: [defaultRules]
            })(<Input placeholder='column' />)}
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item style={{ display: 'inline-block', width: '100%' }}>
            {getFieldDecorator(`filters[${k}].operation`, {
              initialValue: initialFilters[k]
                ? initialFilters[k].operation
                : undefined,
              rules: [defaultRules]
            })(
              <Select placeholder='operation'>
                <Select.Option value='=='>(_eq) Equals to</Select.Option>
                <Select.Option value='!='>(_ne) Not equals to</Select.Option>
                <Select.Option value='>'>(_gt) Greater than</Select.Option>
                <Select.Option value='<'>(_lt) Less than</Select.Option>
                <Select.Option value='>='>
                  (_gte) Greater than equal to
                </Select.Option>
                <Select.Option value='<='>
                  (_lte) Less than equal to
                </Select.Option>
                <Select.Option value='in'>(_in) In</Select.Option>
                <Select.Option value='nin'>(_nin) Not In</Select.Option>
                <Select.Option value='regex'>Regex</Select.Option>
                <Select.Option value='contains'>Contains</Select.Option>
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item style={{ display: 'inline-block', width: '100%' }}>
            {getFieldDecorator(`filters[${k}].datatype`, {
              initialValue: initialFilters[k]
                ? initialFilters[k].datatype
                : 'string'
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
        {getFieldValue(`filters[${k}].datatype`) !== 'array' && (
          <Col span={7}>
            <Form.Item
              style={{
                display: 'inline-block',
                width: '100%',
                border:
                  getFieldValue(`filters[${k}].datatype`) === 'json'
                    ? '1px solid #D9D9D9'
                    : ''
              }}
            >
              {getFieldValue(`filters[${k}].datatype`) === 'id' &&
                getFieldDecorator(`filters[${k}].value`, {
                  initialValue: initialFilters[k]
                    ? initialFilters[k].value
                    : undefined,
                  rules: [defaultRules]
                })(<Input placeholder='value' />)}
              {getFieldValue(`filters[${k}].datatype`) === 'string' &&
                getFieldDecorator(`filters[${k}].value`, {
                  initialValue: initialFilters[k]
                    ? initialFilters[k].value
                    : undefined,
                  rules: [defaultRules]
                })(<Input placeholder='value' />)}
              {getFieldValue(`filters[${k}].datatype`) === 'integer' &&
                getFieldDecorator(`filters[${k}].value`, {
                  initialValue: initialFilters[k]
                    ? initialFilters[k].value
                    : undefined,
                  rules: [defaultRules]
                })(
                  <InputNumber style={{ width: '100%' }} placeholder='value' />
                )}
              {getFieldValue(`filters[${k}].datatype`) === 'float' &&
                getFieldDecorator(`filters[${k}].value`, {
                  initialValue: initialFilters[k]
                    ? initialFilters[k].value
                    : undefined,
                  rules: [defaultRules]
                })(
                  <InputNumber style={{ width: '100%' }} placeholder='value' />
                )}
              {getFieldValue(`filters[${k}].datatype`) === 'boolean' &&
                getFieldDecorator(`filters[${k}].value`, {
                  initialValue: initialFilters[k]
                    ? initialFilters[k].value
                    : true,
                    rules: [defaultRules]
                })(
                  <Select>
                    <Select.Option value={true}>true</Select.Option>
                    <Select.Option value={false}>false</Select.Option>
                  </Select>
                )}
              {getFieldValue(`filters[${k}].datatype`) === 'datetime' &&
                getFieldDecorator(`filters[${k}].value`, {
                  initialValue: initialFilters[k]
                    ? initialFilters[k].value
                    : moment,
                  rules: [defaultRules]
                })(<DatePicker showTime />)}
              {getFieldValue(`filters[${k}].datatype`) === 'json' && (
                <>
                  {getFieldDecorator(`filters[${k}].value`, {
                    initialValue: initialFilters[k]
                      ? JSON.stringify(initialFilters[k].value, null, 2)
                      : '{}'
                  })}
                  <CodeMirror
                    value={getFieldValue(`filters[${k}].value`)}
                    style={{ width: '100%', border: '1px solid #D9D9D9' }}
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
                      const key = `filters[${k}].value`;
                      setFieldsValue({
                        [key]: value
                      });
                    }}
                  />
                </>
              )}
            </Form.Item>
          </Col>
        )}
        <Col span={2}>
          <Button
            type='link'
            style={{ color: 'black' }}
            onClick={() => removeFilter(k)}
          >
            <Icon type='close' />
          </Button>
        </Col>
      </Row>
      {getFieldValue(`filters[${k}].datatype`) === 'array' && (
        <div
          style={{
            margin: '0px 60px 25px',
            padding: 16,
            border: '1px solid #E8E8E8'
          }}
        >
          <ArrayForm k={k} form={props.form} initialArrays = {initialFilters[k] ? initialFilters[k].arrays ? initialFilters[k].arrays : [] : []}/>
        </div>
      )}
    </>
  ));

  //SORTERS
  let initialSorterKeys = [];
  if (initialSorters.length > 0) {
    for (let i = 0; i < initialSorters.length; i++) {
      initialSorterKeys.push(i);
    }
  }

  const removeSorter = k => {
    const sorterKeys = getFieldValue('sorterKeys');
    setFieldsValue({
      sorterKeys: sorterKeys.filter(key => key !== k)
    });
  };

  const addSorter = () => {
    const sorterKeys = getFieldValue('sorterKeys');
    const nextKeys = sorterKeys.concat(sorters++);
    setFieldsValue({
      sorterKeys: nextKeys
    });
  };

  getFieldDecorator('sorterKeys', { initialValue: initialSorterKeys });
  const sorterKeys = getFieldValue('sorterKeys');
  const formItemsSorters = sorterKeys.map((k, index) => (
    <Row key={k} gutter={16}>
      <Col span={7}>
        <Form.Item style={{ display: 'inline-block' }}>
          {getFieldDecorator(`sorters[${k}].column`, {
            initialValue: initialSorters[k]
              ? initialSorters[k].column
              : undefined,
            rules: [defaultRules]
          })(<Input placeholder='column' />)}
        </Form.Item>
        <br />
      </Col>
      <Col span={7}>
        <Form.Item style={{ display: 'inline-block', width: '100%' }}>
          {getFieldDecorator(`sorters[${k}].order`, {
            initialValue: initialSorters[k]
              ? initialSorters[k].order
              : undefined,
            rules: [defaultRules]
          })(
            <Select placeholder='order'>
              <Select.Option value='ascending'>Ascending</Select.Option>
              <Select.Option value='descending'>Descending</Select.Option>
            </Select>
          )}
        </Form.Item>
      </Col>
      <Col span={3}>
        <Button
          type='link'
          style={{ color: 'black' }}
          onClick={() => removeSorter(k)}
        >
          <Icon type='close' />
        </Button>
      </Col>
    </Row>
  ));

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
          resetFields();
        }
      }}
      cancelText='Reset filters & sorters'
      onCancel={props.handleCancel}
      onOk={handleSubmitClick}
      className='filter-sorter-modal'
    >
      <Form layout='vertical' onSubmit={handleSubmitClick}>
        <FormItemLabel name='Filter' />
        <div style={{ marginBottom: 30 }}>
          {formItemsFilters}
          <Button
            type='link'
            onClick={() => filterAdd()}
            style={{
              padding: 0,
              marginTop: -10,
              color: 'rgba(0, 0, 0, 0.6)'
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
        </div>
        <FormItemLabel name='Sort' />
        {formItemsSorters}
        <Button
          type='link'
          onClick={() => addSorter()}
          style={{ padding: 0, marginTop: -10, color: 'rgba(0, 0, 0, 0.6)' }}
        >
          <span
            className='material-icons'
            style={{ position: 'relative', top: 5, marginRight: 5 }}
          >
            add_circle
          </span>
          Add field
        </Button>
      </Form>
    </Modal>
  );
};

export default Form.create({})(FilterSorterForm);
