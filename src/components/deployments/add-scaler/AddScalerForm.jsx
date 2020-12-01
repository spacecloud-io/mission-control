import React from 'react';
import { Modal, Form, Radio, Input, Alert, Row, Col, Button, AutoComplete, Select } from 'antd';
import RadioCards from '../../radio-cards/RadioCards';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import { kedaTriggerTypes } from '../../../constants';
import { DeleteOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import ObjectAutoComplete from '../../object-autocomplete/ObjectAutoComplete';

const AddScalerForm = (props) => {

  const { initialValues, secrets, handleSubmit, handleCancel, scalerNames = [] } = props;
  const [form] = Form.useForm();

  const getSelectedType = (type) => {
    switch (type) {
      case 'requests-per-second':
        return 'requests-per-second';
      case 'active-requests':
        return 'active-requests';
      case 'cpu':
        return 'cpu';
      case 'memory':
        return 'memory';
      default:
        return 'keda'
    }
  }

  const formInitialValue = {
    name: initialValues && initialValues.name ? initialValues.name : '',
    type: initialValues && initialValues.type ? getSelectedType(initialValues.type) : 'requests-per-second',
    requestsPerSecondTarget: initialValues && initialValues.metadata && initialValues.type === 'requests-per-second' ? initialValues.metadata.target : '',
    activeRequestsTarget: initialValues && initialValues.metadata && initialValues.type === 'active-requests' ? initialValues.metadata.target : '',
    cpuThresholdType: initialValues && initialValues.metadata && initialValues.type === 'cpu' ? initialValues.metadata.type : 'Utilization',
    memoryThresholdType: initialValues && initialValues.metadata && initialValues.type === 'memory' ? initialValues.metadata.type : 'Utilization',
    cpuValue: initialValues && initialValues.metadata && initialValues.type === 'cpu' ? initialValues.metadata.value : '',
    memoryValue: initialValues && initialValues.metadata && initialValues.type === 'memory' ? initialValues.metadata.value : '',
    kedaType: initialValues && initialValues.type && getSelectedType(initialValues.type) === 'keda' ? initialValues.type : undefined,
    kedaTargets: initialValues && initialValues.metadata && getSelectedType(initialValues.type) === 'keda' ?
      Object.entries(initialValues.metadata).map(([key, value]) => ({ key: key, value: value })) : [],
    kedaSecrets: initialValues && initialValues.authRef && initialValues.authRef.secretMapping ? initialValues.authRef.secretMapping : []
  }

  const handleSubmitClick = () => {
    form.validateFields().then(values => {
      const operation = initialValues ? 'edit' : 'add';
      let triggersConfig = {};
      switch (values.type) {
        case 'requests-per-second':
          triggersConfig = {
            name: values.name,
            type: values.type,
            metadata: { target: values.requestsPerSecondTarget }
          };
          break;
        case 'active-requests':
          triggersConfig = {
            name: values.name,
            type: values.type,
            metadata: { target: values.activeRequestsTarget }
          };
          break;
        case 'cpu':
          triggersConfig = {
            name: values.name,
            type: values.type,
            metadata: { type: values.cpuThresholdType, value: values.cpuValue }
          };
          break;
        case 'memory':
          triggersConfig = {
            name: values.name,
            type: values.type,
            metadata: { type: values.memoryThresholdType, value: values.memoryValue }
          };
          break;
        default:
          triggersConfig = {
            name: values.name,
            type: values.kedaType,
            metadata: values.kedaTargets.reduce((prev, cur) => Object.assign({}, prev, { [cur.key]: cur.value }), {}),
            authRef: { secretMapping: values.kedaSecrets }
          };
          break;
      }
      handleSubmit(triggersConfig, operation)
      handleCancel()
    })
  }

  const secretObj = secrets.reduce((prevSecret, currSecret) => {
    return Object.assign({}, prevSecret,
      { [currSecret.id]: Object.keys(currSecret.data).reduce((prev, curr) => Object.assign({}, prev, { [curr]: true }), {}) })
  }, {})

  const autoCompleteOptions = { secrets: secretObj }

  const kedaAlertDes = <div>
    Check out the <a href='https://keda.sh/docs' target='_blank' style={{ color: '#4DA9FF' }}>documentation of KEDA </a>
    for the list of event trigger sources and their configuration. Space Cloud transparently forwards
    the provided metadata to the KEDA. For providing <a href='https://keda.sh/docs/1.4/concepts/authentication/' target='_blank' style={{ color: '#4DA9FF' }}> TriggerAuthentication </a>
    create Space Cloud secret and specify the keys in the Secret metadata section below.
  </div>

  const modalProps = {
    className: "edit-item-modal",
    visible: props.visible,
    width: 720,
    okText: initialValues ? "Save" : "Add",
    title: initialValues ? "Update scaler" : "Add scaler",
    onOk: handleSubmitClick,
    onCancel: props.handleCancel
  };
  return (
    <Modal {...modalProps}>
      <Form layout='vertical' form={form} initialValues={formInitialValue}>
        <FormItemLabel name='Name' />
        <Form.Item name='name' rules={[{
          validator: (_, value, cb) => {
            if (!value) {
              cb("Please input a name")
              return
            }
            const check = scalerNames.some(data => value === data);
            if (check && !initialValues) {
              cb("This name is already taken by another scaler. Please provide a unique name!")
              return
            }
            cb()
          }
        }]}>
          <Input
            placeholder='Name'
            style={{ width: '80%' }}
            disabled={initialValues ? true : false} />
        </Form.Item>
        <FormItemLabel name='Scaler type' />
        <Form.Item name='type' rules={[{ required: true, message: 'Please select a scaler type!' }]}>
          <RadioCards>
            <Radio.Button value='requests-per-second'>Requests per second</Radio.Button>
            <Radio.Button value='active-requests'>Active requests</Radio.Button>
            <Radio.Button value='cpu'>CPU</Radio.Button>
            <Radio.Button value='memory'>Memory</Radio.Button>
            <Radio.Button value='keda'>KEDA Events</Radio.Button>
          </RadioCards>
        </Form.Item>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'requests-per-second'}>
          <FormItemLabel name='Requests per second' />
          <Form.Item name='requestsPerSecondTarget' rules={[{ required: true, message: 'Please input requests per second' }]}>
            <Input placeholder='Request per second' style={{ width: '80%' }} />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'active-requests'}>
          <FormItemLabel name='Active requests' />
          <Form.Item name='activeRequestsTarget' rules={[{ required: true, message: 'Please input active requests' }]}>
            <Input placeholder='Active requests' style={{ width: '80%' }} />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'cpu'}>
          <FormItemLabel name='Threshold type' />
          <Form.Item name="cpuThresholdType" style={{ width: '80%' }} >
            <Select placeholder='Type'>
              <Select.Option value='Utilization'>Average utilization percentage</Select.Option>
              <Select.Option value='AverageValue'>Average value</Select.Option>
              <Select.Option value='Value'>Total value</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item shouldUpdate={(prev, curr) => prev.cpuThresholdType !== curr.cpuThresholdType}>
            {
              () => {
                const cpuThresholdType = form.getFieldValue("cpuThresholdType")
                let label = ""
                switch (cpuThresholdType) {
                  case "Utilization":
                    label = "Average CPU utilization percentage"
                    break;
                  case "AverageValue":
                    label = "Average CPU consumption"
                    break;
                  case "Value":
                    label = "Total CPU consumption"
                    break;
                }
                const errorMsg = `Please input ${label.toLowerCase()}`

                return (
                  <React.Fragment>
                    <FormItemLabel name={label} />
                    <Form.Item name='cpuValue' rules={[{ required: true, message: errorMsg }]}>
                      <Input placeholder={label} style={{ width: '80%' }} />
                    </Form.Item>
                  </React.Fragment>
                )
              }
            }
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'memory'}>
          <FormItemLabel name='Threshold type' />
          <Form.Item name="memoryThresholdType">
            <Select placeholder='Type' style={{ width: '80%' }} >
              <Select.Option value='Utilization'>Average utilization percentage</Select.Option>
              <Select.Option value='AverageValue'>Average value</Select.Option>
              <Select.Option value='Value'>Total value</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item shouldUpdate={(prev, curr) => prev.memoryThresholdType !== curr.memoryThresholdType}>
            {
              () => {
                const memoryThresholdType = form.getFieldValue("memoryThresholdType")
                let label = ""
                switch (memoryThresholdType) {
                  case "Utilization":
                    label = "Average memory utilization percentage"
                    break;
                  case "AverageValue":
                    label = "Average memory consumption"
                    break;
                  case "Value":
                    label = "Total memory consumption"
                    break;
                }
                const errorMsg = `Please input ${label.toLowerCase()}`

                return (
                  <React.Fragment>
                    <FormItemLabel name={label} />
                    <Form.Item name='memoryValue' rules={[{ required: true, message: errorMsg }]}>
                      <Input placeholder={label} style={{ width: '80%' }} />
                    </Form.Item>
                  </React.Fragment>
                )
              }
            }
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'keda'}>
          <Alert showIcon type='info' message=' ' description={kedaAlertDes} style={{ margin: '24px 0' }} />
          <FormItemLabel name='KEDA trigger type' />
          <Form.Item name='kedaType' rules={[{ required: true, message: 'Please select KEDA type' }]}>
            <AutoComplete
              placeholder='Select a KEDA trigger type'
              options={kedaTriggerTypes}
              filterOption={true} />
          </Form.Item>
          <FormItemLabel name='Metadata' />
          <Form.List name="kedaTargets" style={{ display: "inline-block" }}>
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map((field, index) => (
                    <React.Fragment>
                      <Row key={field}>
                        <Col span={10}>
                          <Form.Item name={[field.name, "key"]} validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: "Please input key" }]}>
                            <Input
                              style={{ width: "90%", marginRight: "6%", float: "left" }}
                              placeholder="Key"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: "Please input value" }]}
                            name={[field.name, "value"]}
                          >
                            <Input
                              placeholder="Value"
                              style={{ width: "90%", marginRight: "6%", float: "left" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          {fields.length > 0 ? (
                            <Button
                              onClick={() => remove(field.name)}
                              style={{ marginRight: "2%", float: "left" }}
                            >
                              <DeleteOutlined />
                            </Button>
                          ) : null}
                        </Col>
                      </Row>
                    </React.Fragment>
                  ))}
                  <Form.Item>
                    <Button
                      onClick={() => {
                        const fieldKeys = [
                          ...fields.map(obj => ["kedaTargets", obj.name, "key"]),
                          ...fields.map(obj => ["kedaTargets", obj.name, "value"])
                        ]
                        form.validateFields(fieldKeys)
                          .then(() => add())
                          .catch(ex => console.log("Exception", ex))
                      }}
                      style={{ marginRight: "2%", float: "left" }}
                    >
                      <PlusOutlined /> Add
                          </Button>
                  </Form.Item>
                </div>
              );
            }}
          </Form.List>
          <FormItemLabel name='Secret metadata' />
          <Form.List name="kedaSecrets" style={{ display: "inline-block" }}>
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map((field, index) => (
                    <React.Fragment>
                      <Row key={field}>
                        <Col span={10}>
                          <Form.Item name={[field.name, "param"]} validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: "Please input key" }]}>
                            <Input
                              style={{ width: "90%", marginRight: "6%", float: "left" }}
                              placeholder="Key"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: 'Please input secret' }]}
                            name={[field.name, "key"]}
                          >
                            <ObjectAutoComplete
                              placeholder="Secret"
                              options={autoCompleteOptions}
                              style={{ width: "90%", marginRight: "6%", float: "left" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          {fields.length > 0 ? (
                            <Button
                              onClick={() => remove(field.name)}
                              style={{ marginRight: "2%", float: "left" }}
                            >
                              <DeleteOutlined />
                            </Button>
                          ) : null}
                        </Col>
                      </Row>
                    </React.Fragment>
                  ))}
                  <Form.Item>
                    <Button
                      onClick={() => {
                        const fieldKeys = [
                          ...fields.map(obj => ["param", obj.name, "param"]),
                          ...fields.map(obj => ["key", obj.name, "key"])
                        ]
                        form.validateFields(fieldKeys)
                          .then(() => add())
                          .catch(ex => console.log("Exception", ex))
                      }}
                      style={{ marginRight: "2%", float: "left" }}
                    >
                      <PlusOutlined /> Add
                          </Button>
                  </Form.Item>
                </div>
              );
            }}
          </Form.List>
        </ConditionalFormBlock>
      </Form>
    </Modal>
  );
}

export default AddScalerForm;