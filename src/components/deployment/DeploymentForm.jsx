import React from "react"

import { Modal, Form, Input, InputNumber, Radio, Select, Collapse, Row, Col, Button, Icon } from 'antd';
import { getEventSourceFromType } from "../../utils";
import RadioCard from "../radio-card/RadioCard"
import FormItemLabel from "../form-item-label/FormItemLabel"


let id = 1;
const DeploymentForm = (props) => {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        let options = values.options
        if (options && !options.col) {
          delete options["col"]
        }

        console.log(values)
        props.handleCancel();
        props.form.resetFields();
      }
    });
  }
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;
  const { name, url, username, password, ports, vCPU, ram, min, max } = props.initialValues ? props.initialValues : {}

  const remove = k => {
    const keys = getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }

    setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  const add = () => {

    const keys = getFieldValue('keys');
    const nextKeys = keys.concat(id++);
    setFieldsValue({
      keys: nextKeys,
    });
  };

  const initialKeys = [0];
    if (ports) {
      for (let i = 0; i < ports.length; i++) {
        initialKeys.push(i+1);
      }
    }

  getFieldDecorator('keys', { initialValue: initialKeys });
  const keys = getFieldValue('keys');
  const formItems = keys.map((k, index) => (
    <Row key={k}>
      <Col span={8}>
        <Form.Item
          style={{ display: 'inline-block', marginRight: 30 }}
        >
          {getFieldDecorator(`ports[${k}]`, {
            initialValue: ports ? ports[k] : null
          })(
            <Input placeholder="eg: 8080" />
          )}
        </Form.Item>
      </Col>
      {index === keys.length - 1 ?
        <Button
          style={{ border: '1px solid #1890FF', color: '#1890FF' }}
          onClick={add}
        >
          Add
    </Button>
        : <Button onClick={() => remove(k)}>
          <Icon type='delete' />
        </Button>
      }
    </Row>
  ));
      console.log(keys)

  return (
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Deployment`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={props.visible}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit} >
        <FormItemLabel name="Name" />
        <Form.Item>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please provide a name!' }],
            initialValue: name
          })(
            <Input placeholder="eg:email-sender" />
          )}
        </Form.Item>
        <FormItemLabel name="Container Image URL" />
        <Form.Item>
          {getFieldDecorator('url', {
            rules: [{ required: true, message: 'Please provide an url!' }],
            initialValue: url
          })(
            <Input placeholder="eg: tom/hello-world:latest" />
          )}
        </Form.Item>
        <FormItemLabel name="Image type" />
        <Form.Item>
          {getFieldDecorator('type', {
            rules: [{ required: true, message: 'Please select a type!' }],
            initialValue: "private"
          })(
            <Radio.Group>
              <RadioCard value="private">Private</RadioCard>
              <RadioCard value="public">Public</RadioCard>
            </Radio.Group>
          )}
        </Form.Item>
        {getFieldValue('type') === 'private' && (
          <>
        <FormItemLabel name="Repository credentials" description="for private images" />
        <div style={{ display: "flex" }}>
          <Form.Item style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
            {getFieldDecorator('username', {initialValue: username})
              (
                <Input placeholder="Username" />
              )}
          </Form.Item>
          <Form.Item style={{ flexGrow: 1, width: 200 }}>
            {getFieldDecorator('password', {initialValue: password})
              (
                <Input.Password placeholder="Password" />
              )}
          </Form.Item>
        </div>
        </>
        )}
        <React.Fragment>
          <FormItemLabel name="Expose Ports" />
          {formItems}
        </React.Fragment>
        <Collapse bordered={false} >
          <Collapse.Panel header="Advanced settings" key="advanced">
            <FormItemLabel name="Resources" />
            <div style={{ display: "flex" }}>
              <Form.Item style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
                {getFieldDecorator('vcpu', {initialValue: vCPU})
                  (
                    <Input addonAfter="vCPU" />
                  )}
              </Form.Item>
              <Form.Item style={{ flexGrow: 1, width: 200 }}>
                {getFieldDecorator('ram', {initialValue: ram})
                  (
                    <Input addonAfter="RAM (MBs)" />
                  )}
              </Form.Item>
            </div>
            <FormItemLabel name="Auto Scaling" />
            <div style={{ display: "flex" }}>
              <Form.Item style={{ flexGrow: 1, width: 200, marginRight: 10 }}>
                {getFieldDecorator('min', { initialValue: min ? min : 0 })
                  (
                    <Input addonBefore="MIN" />
                  )}
              </Form.Item>
              <Form.Item style={{ flexGrow: 1, width: 200 }}>
                {getFieldDecorator('max', { initialValue: max ? max : 0 })
                  (
                    <Input addonBefore="MAX" />
                  )}
              </Form.Item>
            </div>
            <FormItemLabel name="Upstreams" />
          </Collapse.Panel>
        </Collapse>
      </Form>
    </Modal>
  );
}

const WrappedDeploymentForm = Form.create({})(DeploymentForm);

export default WrappedDeploymentForm

