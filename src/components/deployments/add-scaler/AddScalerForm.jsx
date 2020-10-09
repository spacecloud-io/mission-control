import React from 'react';
import { Modal, Form, Radio, Input, Alert, Select, Row, Col, Button } from 'antd';
import RadioCards from '../../radio-cards/RadioCards';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import { KedaTiggerType, spaceCloudClusterOrigin } from '../../../constants';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ObjectAutoComplete from '../../object-autocomplete/ObjectAutoComplete';

const AddScalerForm = (props) =>{

  const { initialValues, secrets, handleSubmit, handleCancel } = props;
  const [form] = Form.useForm();

  const selectedType = (type) => {
    switch (type) {
      case 'requests-per-second':
        return 'requests-per-second';
        break;
      case 'active-requests':
        return 'active-requests';
        break;
      case 'cpu':
        return 'cpu';
        break;
      case 'ram':
        return 'ram';
        break;
      default: return 'keda'
        break;
    }
  }

  const formInitialValue = {
    name: initialValues && initialValues.name ? initialValues.name : '',
    type: initialValues && initialValues.type ? selectedType(initialValues.type) : 'requests-per-second',
    target: initialValues && initialValues.metadata ? initialValues.metadata : '',
    kedaType: initialValues && initialValues.type ? initialValues.type : null,
    kedaTargets: initialValues && initialValues.metadata ? initialValues.metadata : [],
    kedaSecrets: initialValues && initialValues.authRef ? initialValues.authRef : []
  }

  const handleSubmitClick = () => {
    form.validateFields().then(values =>{
      const operation = initialValues ? 'edit' : 'add';
      values.target = Number(values.target);
      handleSubmit(values, operation)
      handleCancel()
    })
  }

  const envSecrets = secrets.filter(secret => secret.type === 'env')

  const sceretObj = envSecrets.reduce((prevSecret, curSecret) => {
    return Object.assign({}, prevSecret, 
        { [curSecret.id]: Object.keys(curSecret.data).reduce((prev, cur) => Object.assign({}, prev, { [cur]: true }),{}) })
  }, {})

  const autoCompleteOptions = { secrets: sceretObj }

  const kedaAlertDes = <div>
    Check out the <a href='https://keda.sh/docs' target='_blank' style={{ color: '#4DA9FF' }}>documentation of KEDA </a>
    for the list of event trigger sources and their configuration. Space Cloud transparently forwards 
    the provided metadata to the KEDA. For providing <a href='' style={{ color: '#4DA9FF' }}> TriggerAuthentication </a> 
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
  return(
    <Modal {...modalProps}>
      <Form layout='vertical' form={form} initialValues={formInitialValue}>
        <FormItemLabel name='Name' />
        <Form.Item name='name' rules={[{ required: true, message: 'Please input a name' }]}>
          <Input placeholder='Name' style={{ width: '80%' }} />
        </Form.Item>
        <FormItemLabel name='Scaler type' />
        <Form.Item name='type' rules={[{ required: true, message: 'Please select a scaler type!' }]}>
          <RadioCards>
            <Radio.Button value='requests-per-second'>Requests per second</Radio.Button>
            <Radio.Button value='active-requests'>Active requests</Radio.Button>
            <Radio.Button value='cpu'>CPU</Radio.Button>
            <Radio.Button value='ram'>RAM</Radio.Button>
            <Radio.Button value='keda'>Event driven (KEDA)</Radio.Button>
          </RadioCards>
        </Form.Item>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'requests-per-second'}>
          <FormItemLabel name='Requests per second' />
          <Form.Item name='target' rules={[{ required: true, message: 'Please input requests per second' }]}>
            <Input placeholder='Request per second' style={{ width: '80%' }} />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'active-requests'}>
          <FormItemLabel name='Active requests' />
          <Form.Item name='target' rules={[{ required: true, message: 'Please input active requests' }]}>
            <Input placeholder='Active requests' style={{ width: '80%' }} />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'cpu'}>
          <FormItemLabel name='Percentage of CPU consumption' />
          <Form.Item name='target' rules={[{ required: true, message: 'Please input CPU consumption in percentage' }]}>
            <Input placeholder='CPU consumption' style={{ width:'80%' }} />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'ram'}>
          <FormItemLabel name='Percentage of RAM consumption' />
          <Form.Item name='target' rules={[{ required: true, message: 'Please input RAM consumption in percentage' }]}>
            <Input placeholder='RAM consumption' style={{ width: '80%' }} />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'keda'}>
          <Alert showIcon type='info' message=' ' description={kedaAlertDes} style={{ margin: '24px 0' }} />
          <FormItemLabel name='KEDA trigger type' />
          <Form.Item name='kedaType' rules={[{ required: true, message: 'Please select KEDA type' }]}>
            <Select placeholder='Select a KEDA trigger type' style={{ width: '80%' }}>
              {Object.entries(KedaTiggerType).map(([key, value]) => {
                return <Select.Option value={value}>{key}</Select.Option>
              })}
            </Select>
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
                          {fields.length > 1 ? (
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
                          ...fields.map(obj => ["kedaTargets", obj.name,"key"]),
                          ...fields.map(obj => ["kedaTargets", obj.name,"value"])
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
                            rules={[{ required: true, message: 'Please input secret key' }]}
                            name={[field.name, "secretKey"]}
                          >
                            <ObjectAutoComplete
                              placeholder="Secret key"
                              options={autoCompleteOptions}
                              style={{ width: "90%", marginRight: "6%", float: "left" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          {fields.length > 1 ? (
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
                          ...fields.map(obj => ["kedaSecrets", obj.name,"key"]),
                          ...fields.map(obj => ["kedaSecrets", obj.name,"secretKey"])
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