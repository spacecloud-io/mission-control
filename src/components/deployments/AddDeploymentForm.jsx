import React, { useState } from 'react';
import './add-deployment-form.css';
import FormItemLabel from "../form-item-label/FormItemLabel"
import ServiceTemplate from '../service-template/ServiceTemplate';
import AdvancedForm from "./AdvancedForm";

import { Modal, Form, Radio, Input, Row, Col, Select, Button, Icon, Collapse } from 'antd';
const {Option} = Select;
const {Panel} = Collapse;

let ports = 1;
const AddDeploymentForm = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue, validateFields } = props.form;
  const [selectedService, setSelectedService] = useState('');

  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
       console.log(values)
      }
    });
  };

  const remove = k => {
    const keys = getFieldValue("keys");
    if (keys.length === 1) {
      return;
    }

    setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  const add = (id) => {
    if(getFieldValue(`ports[${id}].port`)){
      const keys = getFieldValue("keys");
      const nextKeys = keys.concat(ports++);
      setFieldsValue({
        keys: nextKeys
      });
    }
    else{
      validateFields([`ports[${id}].port`])
    }
  };

  const initialKeys = [0];

  getFieldDecorator("keys", { initialValue: initialKeys });
  const keys = getFieldValue("keys");
  const formItemsPorts = keys.map((k, index) => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`ports[${k}].protocol`, {
            initialValue: "http"
          })(<Select style={{width: 120}}>
            <Option value="http">HTTP</Option>
          </Select>)}
        </Form.Item>
      </Col>
      <Col span={9}>
        <Form.Item style={{marginLeft: -40, marginRight: 30}}>
          {getFieldDecorator(`ports[${k}].port`, { rules: [{ required: true, message: 'Please fill this field before adding!' }]})
          (<Input placeholder="Port (Example: 8080)" style={{width: 280}}/>)}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index === keys.length - 1 && (
          <Button onClick={() => add(index)}>
            Add
          </Button>
        )}
        {index !== keys.length - 1 && (
          <Button onClick={() => remove(k)}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));

  const withFooter = {
    className:'edit-item-modal',
    visible:props.visible,
    width:720,
    okText:"Deploy",
    title:"Deploy Service",
    onOk:handleSubmitClick,
    onCancel:props.handleCancel
  }

  const withoutFooter = {
    className:'edit-item-modal',
    visible:props.visible,
    width:720,
    okText:"Deploy",
    title:"Deploy Service",
    onOk:handleSubmitClick,
    onCancel:props.handleCancel,
    footer: null
  }

  const modalProps = getFieldValue("service") === "dockerized" ? withFooter : withoutFooter

  return (
    <div>
      <Modal
        {...modalProps}
      >
        <Form layout="vertical" onSubmit={handleSubmitClick}>
            <FormItemLabel name="Types of service" />
            <Form.Item>
                {getFieldDecorator('service', {
                 rules: [{ required: true, message: 'Please select a service!' }],
                 initialValue: "postgres"
                })(
                <Radio.Group onChange={e => setSelectedService(e.target.value)}>
                    <Radio.Button className="radio-card" value="nondockerized" style={{padding: 0}}>
                        <ServiceTemplate
                         heading="Non dockerized code"
                         active={selectedService === "nondockerized"}
                        />
                    </Radio.Button>
                    <Radio.Button className="radio-card" value="dockerized">
                        <ServiceTemplate
                         heading="Docker container"
                         active={selectedService === "dockerized"} 
                        />
                    </Radio.Button>
                </Radio.Group>
                )}
            </Form.Item>
            <br/>
            {getFieldValue("service") === "dockerized" && (
            <>
                <FormItemLabel name="Service ID" />
                <Form.Item>
                    {getFieldDecorator('service_id', {
                     rules: [{ required: true, message: 'Please name your service!' }]
                    })(
                    <Input placeholder="Unique name for your service" style={{width: 288}}/>
                    )}
                </Form.Item>
                <FormItemLabel name="Docker container" />
                <Form.Item>
                    {getFieldDecorator('docker_container', {
                     rules: [{ required: true, message: 'Please input docker container!' }]
                    })(
                    <Input placeholder="eg: spaceuptech/space-cloud:v0.15.0" />
                    )}
                </Form.Item>
                <FormItemLabel name="Docker registry type" />
                <Form.Item>
                    {getFieldDecorator('registry',{initialValue: "public"})(
                        <Radio.Group>
                            <Radio value="public">Public Registry</Radio>
                            <Radio value="private">Private Registry</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>
                <FormItemLabel name="Docker secret" description="Docker secret for authentication to pull private Docker images"/>
                <Form.Item>
                    {getFieldDecorator('docker_secret', {
                     rules: [{ required: true, message: 'Please input docker secret!' }]
                    })(
                    <Input placeholder="eg: spaceuptech/space-cloud:v0.15.0" />
                    )}
                </Form.Item>
                <FormItemLabel name="Ports" />
                {formItemsPorts}
                <Collapse bordered={false}>
                    <Panel header="Advanced" key="1">
                        <AdvancedForm />
                    </Panel>
                </Collapse>
            </>
            )}
        </Form>
        <br/>
        {getFieldValue("service") === "nondockerized" && (
            <div style={{fontSize: 14, fontWeight: 500, marginRight: 180}}><a style={{color: "#58B3FF"}}>Follow the instructions</a> here to deploy your non dockerized services from your laptop to Space Cloud.</div>
        )}
      </Modal>
    </div>
  );
}

export default Form.create({})(AddDeploymentForm);
