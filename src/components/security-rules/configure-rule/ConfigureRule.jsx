import React, { useState } from 'react';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import {
  Form,
  Select,
  Input,
  Alert,
  Checkbox,
  Drawer,
  Button,
  Row,
  Col,
  AutoComplete,
} from 'antd';
import AntCodeMirror from "../../ant-code-mirror/AntCodeMirror";
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { notify, dbIcons, isJson } from '../../../utils';
import { generateSchemaAST } from '../../../graphql';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FormItem from 'antd/lib/form/FormItem';
import ObjectAutoComplete from "../../object-autocomplete/ObjectAutoComplete";
import { getCollectionSchema, getDbConfigs, getTrackedCollections } from '../../../operations/database';
import { securityRuleGroups } from '../../../constants';

const getInputValueFromActualValue = (value, dataType) => {
  if (value === null || value === undefined) {
    return ""
  }
  if (dataType === "object") {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

const getTypeFromValue = (value) => {
  if (value === "") {
    return
  }

  if (typeof value === "number") return "number"
  if (typeof value === "boolean") return "bool"
  if (typeof value === "string") {
    if (value.includes(".")) return "variable"
    return "string"
  }
  if (typeof value === "object") return "object"
}

const createValueAndTypeValidator = (type, arrayAllowed) => {
  return (_, value, cb) => {
    if (!type) {
      cb()
      return
    }

    if (type === "string") {
      cb()
      return
    }

    // Allow variables
    if (value.includes(".")) {
      cb()
      return
    }


    if (!arrayAllowed && value.includes(",")) {
      cb("Commas are not allowed here!")
      return
    }

    const values = value.split(",").map(v => v.trim())
    const areValuesValid = values.every(v => {
      switch (type) {
        case "number":
          return !isNaN(v)
        case "bool":
          return v === "true" || v === "false"
        case "variable":
          return v.includes(".")
      }
    })
    if (!areValuesValid) {
      let error = ""
      switch (type) {
        case "number":
          error = "Value must be a number or a variable"
          break
        case "bool":
          error = "Value must be a boolean or a variable"
          break
        case "variable":
          error = "Value must be a variable"
          break
      }
      cb(error)
      return
    }
    cb()
  }
}

const parseValue = (value, type) => {
  switch (type) {
    case "number":
      return parseNumber(value)
    case "bool":
      return parseBoolean(value)
    case "object":
      return JSON.parse(value)
    default:
      return value
  }
}

const parseBoolean = (value) => {
  if (value === "true") return true
  if (value === "false") return false
  return value
}

const parseNumber = (value) => {
  return !isNaN(value) ? Number(value) : value
}

const parseArray = (value, type) => {
  if (!value.includes(",")) {
    return value
  }
  return value.split(",").map(value => value.trim()).map(value => parseValue(value, type))
}

const rules = ['allow', 'deny', 'authenticated', 'match', 'and', 'or', 'query', 'webhook', 'force', 'remove', 'encrypt', 'decrypt', 'hash'];

const ConfigureRule = (props) => {
  // form
  const [form] = Form.useForm();

  // Router params
  const { projectID } = useParams();

  // Global state
  const projects = useSelector((state) => state.projects);

  // Component state
  const [selectedDb, setSelectedDb] = useState("");
  const [col, setCol] = useState('');

  // Derived properties
  const { rule, type, f1, f2, error, fields, field, value, url } = props.selectedRule;
  const dbConfigs = useSelector(state => getDbConfigs(state))
  const dbList = Object.entries(dbConfigs).map(([alias, obj]) => {
    if (!obj.type) obj.type = alias;
    return {
      alias: alias,
      dbtype: obj.type,
      svgIconSet: dbIcons(projects, projectID, alias),
    };
  });
  const data = useSelector(state => getTrackedCollections(state, selectedDb))
  const collectionSchemaString = useSelector(state => getCollectionSchema(state, props.ruleMetaData.group, props.ruleMetaData.id))

  // Handlers
  const handleSelectDatabase = (value) => setSelectedDb(value);
  const handleSearch = (value) => setCol(value);

  const onFinish = (values) => {
    // Parse values
    switch (values.rule) {
      case "match":
        if (values.eval === 'in' || values.eval === 'notIn') {
          values.f2 = parseArray(values.f2, values.type)
        } else {
          values.f1 = parseValue(values.f1, values.type)
          values.f2 = parseValue(values.f2, values.type)
        }
        break;
      case "force":
        values.value = parseValue(values.value, values.type)
        delete values["type"]
        break;
      case "query":
        try {
          values.find = JSON.parse(values.find);
        } catch (ex) {
          notify("error", "Error", ex.toString())
          return;
        }
        break;
    }

    delete values.errorMsg;

    if (values.rule === "and" || values.rule === "or") {
      if (!props.selectedRule.clauses) values.clauses = [];
      else values.clauses = props.selectedRule.clauses
    }
    if (values.rule === "query" || values.rule === "force" || values.rule === "remove") {
      values.clause = props.selectedRule.clause
    }
    props.onSubmit(values);
    props.closeDrawer();
  };

  // Autocomplete options
  let autoCompleteOptions = {};

  switch (props.ruleMetaData.ruleType) {
    case securityRuleGroups.DB_COLLECTIONS:
      const colSchemaFields = generateSchemaAST(collectionSchemaString)[props.ruleMetaData.id];
      const schemaFields = colSchemaFields.reduce((prev, curr) => Object.assign({}, prev, { [curr.name]: true }), {})
      switch (props.selectedNodeId) {
        case "create":
          autoCompleteOptions = { args: { op: true, auth: true, token: true, doc: schemaFields } }
          break;
        case "read":
          autoCompleteOptions = { args: { op: true, auth: true, token: true, find: schemaFields } }
          break;
        case "update":
          const update = {
            $set: schemaFields,
            $inc: schemaFields,
            $mul: schemaFields,
            $min: schemaFields,
            $max: schemaFields,
            $currentDate: schemaFields,
            $currentTimestamp: schemaFields
          }
          autoCompleteOptions = { args: { op: true, auth: true, token: true, find: schemaFields, update } }
          break;
        case "delete":
          autoCompleteOptions = { args: { op: true, auth: true, token: true, find: schemaFields } }
          break
      }
      break;
    case securityRuleGroups.FILESTORE:
    case securityRuleGroups.REMOTE_SERVICES:
    case securityRuleGroups.EVENTING:
    case securityRuleGroups.DB_PREPARED_QUERIES:
      autoCompleteOptions = { auth: true, params: true, token: true }
      break;
    case securityRuleGroups.INGRESS_ROUTES:
      const query = {
        path: true,
        pathArray: true,
        params: true,
        headers: true
      }
      autoCompleteOptions = { auth: true, params: true, query }
  }

  const inheritedDataType = getTypeFromValue(value)
  const formInitialValues = {
    rule,
    type: (rule === "force") ? inheritedDataType : type,
    f1: getInputValueFromActualValue(f1, type),
    eval: props.selectedRule.eval,
    f2: getInputValueFromActualValue(f2, type),
    fields,
    field,
    value: getInputValueFromActualValue(value, inheritedDataType),
    url,
    db: props.selectedRule.db,
    col: props.selectedRule.col,
    find: JSON.stringify(props.selectedRule.find, null, 2),
    errorMsg: error ? true : false,
    error
  }

  if (formInitialValues.type === "object") {
    formInitialValues.value = JSON.stringify(formInitialValues.value, null, 2)
  }

  return (
    <Drawer
      title='Configure rule'
      placement='right'
      onClose={props.closeDrawer}
      visible={true}
      width={560}
    >
      <Form
        name='configure'
        form={form}
        onFinish={onFinish}
        initialValues={formInitialValues}
        validateMessages={{ required: "Please provide a value!" }}
      >
        <FormItemLabel name='Rule Type' />
        <Form.Item name='rule'>
          <Select placeholder="Rule">
            {rules.map((val) => (
              <Select.Option key={val} value={val}>
                {val}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <ConditionalFormBlock
          dependency='rule'
          condition={() => form.getFieldValue('rule') === 'match'}
        >
          <FormItemLabel name='Operands data type' />
          <Form.Item name='type' rules={[{ required: true }]}>
            <Select placeholder="Data type">
              <Select.Option value='string'>String</Select.Option>
              <Select.Option value='number'>Number</Select.Option>
              <Select.Option value='bool'>Bool</Select.Option>
            </Select>
          </Form.Item>
          <FormItemLabel name='First operand' />
          <Form.Item shouldUpdate={(prev, curr) => (curr.type !== prev.type)} noStyle>
            {
              () => {
                const type = form.getFieldValue("type")
                return (
                  <Form.Item name='f1' rules={[{ required: true }, { validator: createValueAndTypeValidator(type, false) }]}>
                    <ObjectAutoComplete placeholder="First operand" options={autoCompleteOptions} />
                  </Form.Item>
                )
              }
            }
          </Form.Item>
          <FormItemLabel name='Evaluation type' />
          <Form.Item name='eval'>
            <Select placeholder="Evaluation">
              <Select.Option value='=='>Equals to</Select.Option>
              <Select.Option value='!='>Not equals to</Select.Option>
              <Select.Option value='>'>Greater than</Select.Option>
              <Select.Option value='>='>Greater than equal to</Select.Option>
              <Select.Option value='<'>Lesser than</Select.Option>
              <Select.Option value='<='>Lesser than equal to</Select.Option>
              <Select.Option value='in'>In</Select.Option>
              <Select.Option value='notIn'>Not in</Select.Option>
            </Select>
          </Form.Item>
          <FormItemLabel name='Second operand' />
          <Form.Item shouldUpdate={(prev, curr) => (curr.type !== prev.type)} noStyle>
            {
              () => {
                const type = form.getFieldValue("type")
                return (
                  <Form.Item name='f2' rules={[{ required: true }, { validator: createValueAndTypeValidator(type, true) }]}>
                    <ObjectAutoComplete placeholder="Second operand" options={autoCompleteOptions} />
                  </Form.Item>
                )
              }
            }
          </Form.Item>
          <Alert
            description={
              <div>
                You can use variables and helper functions inside operands
              </div>
            }
            type='info'
            showIcon
            style={{ marginBottom: 24 }}
          />
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency='rule'
          condition={() =>
            form.getFieldValue('rule') === 'encrypt' ||
            form.getFieldValue('rule') === 'decrypt' ||
            form.getFieldValue('rule') === "remove" ||
            form.getFieldValue('rule') === "hash"
          }
        >
          <FormItemLabel name='Fields' />
          <Form.List name='fields'>
            {(fields, { add, remove }) => {
              return (
                <>
                  {fields.map((field, index) => (
                    <Row key={field.key}>
                      <Col span={14}>
                        <Form.Item
                          name={[field.name]}
                          key={[field.name]}
                          validateTrigger="onBlur"
                          rules={[
                            { required: true, message: 'Please enter field!' },
                            { validator: createValueAndTypeValidator("variable", false) }
                          ]}
                        >
                          <ObjectAutoComplete placeholder="Field" options={autoCompleteOptions} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <CloseOutlined
                          style={{ margin: '0 8px' }}
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type='dashed'
                      onClick={() => {
                        add();
                      }}
                      style={{ width: '40%' }}
                    >
                      <PlusOutlined /> Add field
                    </Button>
                  </Form.Item>
                </>
              );
            }}
          </Form.List>
          <Alert
            description={<div>You can use variables inside fields</div>}
            type='info'
            showIcon
            style={{ marginBottom: 24 }}
          />
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency="rule"
          condition={() => form.getFieldValue('rule') === 'force'}
        >
          <FormItemLabel name="Field" />
          <FormItem name="field" validateTrigger="onBlur" rules={[{ required: true }, { validator: createValueAndTypeValidator("variable", false) }]}>
            <ObjectAutoComplete placeholder="Field" options={autoCompleteOptions} />
          </FormItem>
          <FormItemLabel name="Datatype" />
          <FormItem name="type" rules={[{ required: true }]}>
            <Select placeholder="Data type">
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="bool">Bool</Select.Option>
              <Select.Option value="object">Object</Select.Option>
              <Select.Option value="variable">Variable</Select.Option>
            </Select>
          </FormItem>
          <FormItemLabel name="Value" />
          <ConditionalFormBlock
            dependency="type"
            condition={() => form.getFieldValue('type') !== 'object'}>
            <Form.Item shouldUpdate={(prev, curr) => (curr.type !== prev.type)} noStyle>
              {
                () => {
                  const type = form.getFieldValue("type")
                  return (
                    <Form.Item name='value' rules={[{ required: true }, { validator: createValueAndTypeValidator(type, false) }]}>
                      <ObjectAutoComplete placeholder="Value" options={autoCompleteOptions} onChange={(value) => {
                        if (value.includes(".") && type !== "variable") {
                          form.setFieldsValue({ type: "variable" })
                        }
                      }} />
                    </Form.Item>
                  )
                }
              }
            </Form.Item>
          </ConditionalFormBlock>
          <ConditionalFormBlock
            dependency="type"
            condition={() => form.getFieldValue('type') === 'object'}>
            <Form.Item shouldUpdate={(prev, curr) => (curr.type !== prev.type)} noStyle>
              {
                () => {
                  const type = form.getFieldValue("type")
                  return (
                    <Form.Item name='value' rules={[{ required: true }, {
                      validator: (_, value, cb) => {
                        if (!isJson(value)) {
                          cb("Please provide a valid JSON object!")
                          return
                        }
                        cb()
                      }
                    }]} validateTrigger="onBlur">
                      <AntCodeMirror options={{
                        mode: { name: 'javascript', json: true },
                        lineNumbers: true,
                        styleActiveLine: true,
                        matchBrackets: true,
                        autoCloseBrackets: true,
                        tabSize: 2
                      }} />
                    </Form.Item>
                  )
                }
              }
            </Form.Item>
          </ConditionalFormBlock>
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency="rule"
          condition={() => form.getFieldValue('rule') === "webhook"}
        >
          <FormItemLabel name="URL" />
          <FormItem name="url">
            <Input placeholder="URL" />
          </FormItem>
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency='rule'
          condition={() => form.getFieldValue('rule') === 'query'}
        >
          <FormItemLabel name='Database' />
          <Form.Item
            name='db'
            rules={[{ required: true, message: 'Please select a database!' }]}
          >
            <Select
              placeholder='Select a database'
              onSelect={handleSelectDatabase}
            >
              {dbList.map((alias) => (
                <Select.Option value={alias.alias} key={alias.alias}>
                  <img src={alias.svgIconSet} style={{ marginRight: 10 }} />
                  {alias.alias}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <FormItemLabel name='Collection / Table name' />
          <Form.Item name='col' rules={[{ required: true }]}>
            <AutoComplete
              placeholder='Collection / Table name'
              onSearch={handleSearch}
            >
              {data
                .filter(
                  (data) =>
                    data.toLowerCase().indexOf(col.toLowerCase()) !== -1
                )
                .map((data) => (
                  <AutoComplete.Option key={data} value={data}>
                    {data}
                  </AutoComplete.Option>
                ))}
            </AutoComplete>
          </Form.Item>
          <FormItemLabel name='Find query' style={{ border: '1px solid #D9D9D9' }} />
          <Form.Item name="find" rules={[{ required: true }]}>
            <AntCodeMirror options={{
              mode: { name: 'javascript', json: true },
              lineNumbers: true,
              styleActiveLine: true,
              matchBrackets: true,
              autoCloseBrackets: true,
              tabSize: 2
            }} />
          </Form.Item>
        </ConditionalFormBlock>
        <FormItemLabel name='Customize error message' />
        <Form.Item name='errorMsg' valuePropName='checked'>
          <Checkbox checked={error ? true : false}>
            Customize the error message sent to client if the rule fails
          </Checkbox>
        </Form.Item>
        <ConditionalFormBlock
          dependency='errorMsg'
          condition={() => form.getFieldValue('errorMsg') === true}
        >
          <FormItemLabel name='Error message' />
          <Form.Item name='error'>
            <Input placeholder="Error message" />
          </Form.Item>
        </ConditionalFormBlock>
        <span style={{ float: 'right' }}>
          <Button style={{ marginRight: 16 }} onClick={() => props.closeDrawer()}>Cancel</Button>
          <Button type='primary' htmlType='submit'>
            Save
          </Button>
        </span>
      </Form>
    </Drawer>
  );
};

export default ConfigureRule;
