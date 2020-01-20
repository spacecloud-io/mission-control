import React, { useState } from 'react';
import './add-deployment-form.css';
import FormItemLabel from "../form-item-label/FormItemLabel"
import ServiceTemplate from '../service-template/ServiceTemplate';
import {notify} from "../../utils";

import { Modal, Form, Radio, Input, Row, Col, Select, Button, Icon, Collapse, InputNumber } from 'antd';
const {Option} = Select;
const {Panel} = Collapse;

let ports = 1;
let env = 0;
let white = 1;
let upstreams = 1;
const AddDeploymentForm = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue, validateFields } = props.form;
  const [selectedService, setSelectedService] = useState('');

  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
       console.log(values)
       props.handleCancel()
       notify("success", "Deployment added successfully", "", 3)
      }
    });
  };

  const initialKeys = [0];
  // PORTS
  const remove = k => {
    const keys = getFieldValue("keys");
    if (keys.length === 1) {
      return;
    }

    setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  const add = () => {
      const keys = getFieldValue("keys");
      const nextKeys = keys.concat(ports++);
      setFieldsValue({
        keys: nextKeys
      });
  };

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
        <br/>
        {index === keys.length - 1 && (
          <Button onClick={() => add()} style={{marginTop: -10}}>
            Add another pair
          </Button>
        )}
      </Col>
      <Col span={9}>
        <Form.Item style={{marginLeft: -40, marginRight: 30}}>
          {getFieldDecorator(`ports[${k}].port`, { rules: [{ required: true, message: 'Please fill this field before adding!' }]})
          (<Input placeholder="Port (Example: 8080)" style={{width: 280}}/>)}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index !== keys.length - 1 && (
          <Button onClick={() => remove(k)}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));

  // ENVIRONMENT VARIABLES
  const envRemove = (k) => {
    const envKeys = getFieldValue("envKeys");
    setFieldsValue({
      envKeys: envKeys.filter(key => key !== k)
    });
  };

  const envAdd = () => { 
      const envKeys = getFieldValue("envKeys");
      const nextKeys = envKeys.concat(env++);
      setFieldsValue({
          envKeys: nextKeys
      });
  };

  getFieldDecorator("envKeys", { initialValue: [] });
  const envKeys = getFieldValue("envKeys");
  const formItemsEnv = envKeys.map((k) => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`env[${k}].key`, {
            rules: [{ required: true, message: 'Please enter key!' }]
          })(<Input style={{width: 120}} placeholder="Key"/>)}
        </Form.Item>
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30}}>
          {getFieldDecorator(`env[${k}].value`, {
            rules: [{ required: true, message: 'Please enter value before adding another!' }]
          })
          (<Input style={{width: 280, marginLeft: -40, marginRight: 30}} placeholder="Value" />)}
        </Form.Item>
      </Col>
      <Col span={5}>
          <Button onClick={() => envRemove(k)}>
            <Icon type="delete" />
          </Button>    
      </Col>
    </Row>
  ));

  //WHITELIST
  const whiteRemove = k => {
    const whiteKeys = getFieldValue("whiteKeys");
    if (whiteKeys.length === 1) {
      return;
    }

    setFieldsValue({
      whiteKeys: whiteKeys.filter(key => key !== k)
    });
  };

  const whiteAdd = () => {

      const whiteKeys = getFieldValue("whiteKeys");
      const nextKeys = whiteKeys.concat(white++);
      setFieldsValue({
        whiteKeys: nextKeys
      });
    
  };

  getFieldDecorator("whiteKeys", { initialValue: [0] });
  const whiteKeys = getFieldValue("whiteKeys");
  const formItemsWhite = whiteKeys.map((k, index) => (
    <Row key={k} className={index === whiteKeys.length - 1 ? "bottom-spacing" : ""}>
      <Col span={10}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`white[${k}].project_id`, {
            rules: [{ required: true, message: 'Please fill this field before adding!' }],
            initialValue: k === 0 ? "project1" : ""
          })(<Input style={{width: 230}} placeholder="Project ID ( * to select all )"/>)}
        </Form.Item>
      <Icon type="right" style={{fontSize: 12, marginLeft: 16, marginTop: 8}} /><br/>
      {index === whiteKeys.length - 1 && (
          <Button onClick={() => whiteAdd()} style={{marginTop: -10}}>
            Add another field
          </Button>
        )}
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30}}>
          {getFieldDecorator(`white[${k}].service_name`, {
            rules: [{ required: true, message: 'Please fill this field before adding!' }],
            initialValue: k === 0 ? "*" : ""
          })
          (<Input style={{width: 230}} placeholder="Service Name ( * to select all )" />)}
        </Form.Item>
      </Col>
      <Col span={3}>
        {index !== 0 && (
          <Button onClick={() => whiteRemove(k)}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));

  //UPSTREAMS
  const upstreamsRemove = k => {
    const upstreamsKeys = getFieldValue("upstreamsKeys");
    if (upstreamsKeys.length === 1) {
      return;
    }

    setFieldsValue({
      upstreamsKeys: upstreamsKeys.filter(key => key !== k)
    });
  };

  const upstreamsAdd = () => {
      const upstreamsKeys = getFieldValue("upstreamsKeys");
      const nextKeys = upstreamsKeys.concat(upstreams++);
      setFieldsValue({
        upstreamsKeys: nextKeys
      });
  };

  getFieldDecorator("upstreamsKeys", { initialValue: [0] });
  const upstreamsKeys = getFieldValue("upstreamsKeys");
  const formItemsUpstreams = upstreamsKeys.map((k, index) => (
    <Row key={k} className={index === upstreamsKeys.length - 1 ? "bottom-spacing" : ""}>
      <Col span={10}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`upstreams[${k}].project_id`, {
            rules: [{ required: true, message: 'Please fill this field before adding!' }],
            initialValue: k === 0 ? "project1" : ""
          })(<Input style={{width: 230}} placeholder="Project ID ( * to select all )"/>)}
        </Form.Item>
      <Icon type="right" style={{fontSize: 12, marginLeft: 16, marginTop: 8}} /><br/>
      {index === upstreamsKeys.length - 1 && (
          <Button onClick={() => upstreamsAdd(index)} style={{marginTop: -10}}>
            Add another field
          </Button>
        )}
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30}}>
          {getFieldDecorator(`upstreams[${k}].service_name`, {
            rules: [{ required: true, message: 'Please fill this field before adding!' }],
            initialValue: k === 0 ? "*" : ""
          }
          )
          (<Input style={{width: 230}} placeholder="Service Name ( * to select all )" />)}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index !== 0 && (
          <Button onClick={() => upstreamsRemove(k)}>
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
                  <Row>
                    <Col span={12}>
                        <ServiceTemplate
                         heading="Non dockerized code"
                         active={selectedService === "nondockerized"}
                         value="nondockerized"
                        />
                    </Col>
                    <Col span={12}>
                        <ServiceTemplate
                         heading="Docker container"
                         active={selectedService === "dockerized"}
                         value="dockerized" 
                        />
                    </Col>
                  </Row>
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
                <Collapse className="deployment-collapse" bordered={false}>
                    <Panel header="Advanced" key="1">
                      <FormItemLabel name="Resources" />
                      <Form.Item>
                        {getFieldDecorator('resouces', {
                         initialValue: "0.25"
                        })(
                          <Select style={{width: 250}}>
                            <Option value="0.25">1 vCPU / 2 GB Ram</Option>
                          </Select>
                        )}
                      </Form.Item>
                      <FormItemLabel name="Auto scaling" description="Auto scale your container instances between min and max replicas based on the number of requests" />
                      <Form.Item>
                        <>
                          {getFieldDecorator("min", {initialValue: 0})(
                            <Input addonBefore="Min" style={{width: 147}}/>
                          )}
                          {getFieldDecorator("max", {initialValue: 100})(
                            <Input addonBefore="Max" style={{width: 147, marginLeft: 35}}/>
                          )}
                        </>
                      </Form.Item>
                      <FormItemLabel name="Concurrency" description="Number of requests that your single instance can handle parallely" />
                      <Form.Item>
                        {getFieldDecorator("concurrency", {initialValue: 50})(
                          <InputNumber style={{width: 160}}/>
                        )}
                      </Form.Item>
                      <FormItemLabel name="Environment variables" />
                      {formItemsEnv}
                      <Button onClick={() => envAdd()} style={{marginBottom: 20}}>
                        {envKeys.length === 0 ? "Add an environment variable" : "Add another field"}
                      </Button>
                      <FormItemLabel name="Secrets" />
                        <Form.Item>
                          {getFieldDecorator("secrets", {
                            initialValue: "1"
                          })(
                            <Select placeholder="Select secrets to be applied" style={{width: 410}}>
                              <Option value="1">Secret 1</Option>
                            </Select>
                          )}
                        </Form.Item>
                        <FormItemLabel name="Whitelist" description="Only those services that are whitelisted can access you" />
                        {formItemsWhite}
                        <FormItemLabel name="Upstreams" description="The upstream servces that you can access" />
                        {formItemsUpstreams}
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
