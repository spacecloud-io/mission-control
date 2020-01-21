import React from 'react';
import FormItemLabel from "../form-item-label/FormItemLabel";
import { Icon, 
         Form, 
         Select, 
         Button, 
         Input,  
         Row, 
         Col,
        InputNumber  } from "antd";
const { Option } = Select;

let env = 1;
let white = 2;
let upstreams = 2;
let rules = 1;
const Deployment = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue, validateFields } = props.form;

  const initialKeys = [0];
  // ENVIRONMENT VARIABLES
  const envRemove = k => {
    const envKeys = getFieldValue("envKeys");
    if (envKeys.length === 1) {
      return;
    }

    setFieldsValue({
      envKeys: envKeys.filter(key => key !== k)
    });
  };

  const envAdd = (id) => {
    if(getFieldValue(`env[${id}].key`) && getFieldValue(`env[${id}].value`)){
      const envKeys = getFieldValue("envKeys");
      const nextKeys = envKeys.concat(env++);
      setFieldsValue({
        envKeys: nextKeys
      });
    }
    else{
        validateFields([`env[${id}].key`, `env[${id}].value`])
    }
  };

  getFieldDecorator("envKeys", { initialValue: initialKeys });
  const envKeys = getFieldValue("envKeys");
  const formItemsEnv = envKeys.map((k, index) => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`env[${k}].key`, {
            rules: [{ required: true, message: 'Please fill this field before adding!' }]
          })(<Input style={{width: 120}} placeholder="Key"/>)}
        </Form.Item>
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30}}>
          {getFieldDecorator(`env[${k}].value`, {
            rules: [{ required: true, message: 'Please fill this field before adding!' }]
          })
          (<Input style={{width: 280, marginLeft: -40, marginRight: 30}} placeholder="Value" />)}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index === envKeys.length - 1 && (
          <Button onClick={() => envAdd(index)}>
            Add
          </Button>
        )}
        {index !== envKeys.length - 1 && (
          <Button onClick={() => envRemove(k)}>
            <Icon type="delete" />
          </Button>
        )}
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

  const whiteAdd = (id) => {
    if(getFieldValue(`white[${id}].project_id`) && getFieldValue(`white[${id}].service_name`)){
      const whiteKeys = getFieldValue("whiteKeys");
      const nextKeys = whiteKeys.concat(white++);
      setFieldsValue({
        whiteKeys: nextKeys
      });
    }
    else {
      validateFields([`white[${id}].project_id`, `white[${id}].service_name`])
    }
  };

  getFieldDecorator("whiteKeys", { initialValue: [0,1] });
  const whiteKeys = getFieldValue("whiteKeys");
  const formItemsWhite = whiteKeys.map((k, index) => (
    <Row key={k}>
      <Col span={10}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`white[${k}].project_id`, {
            rules: [{ required: true, message: 'Please fill this field before adding!' }],
            initialValue: k === 0 ? "project1" : ""
          })(<Input style={{width: 230}} placeholder="Project ID ( * to select all )"/>)}
        </Form.Item>
      <Icon type="right" style={{fontSize: 12, marginLeft: 16, marginTop: 8}} />
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
        {index === whiteKeys.length - 1 && (
          <Button onClick={() => whiteAdd(index)}>
            Add
          </Button>
        )}
        {index !== whiteKeys.length - 1 && (
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

  const upstreamsAdd = (id) => {
    if(getFieldValue(`upstreams[${id}].project_id`) && getFieldValue(`upstreams[${id}].service_name`)){
      const upstreamsKeys = getFieldValue("upstreamsKeys");
      const nextKeys = upstreamsKeys.concat(upstreams++);
      setFieldsValue({
        upstreamsKeys: nextKeys
      });
    }
    else{
      validateFields([`upstreams[${id}].project_id`, `upstreams[${id}].service_name`])
    }
  };

  getFieldDecorator("upstreamsKeys", { initialValue: [0,1] });
  const upstreamsKeys = getFieldValue("upstreamsKeys");
  const formItemsUpstreams = upstreamsKeys.map((k, index) => (
    <Row key={k}>
      <Col span={10}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`upstreams[${k}].project_id`, {
            rules: [{ required: true, message: 'Please fill this field before adding!' }],
            initialValue: k === 0 ? "project1" : ""
          })(<Input style={{width: 230}} placeholder="Project ID ( * to select all )"/>)}
        </Form.Item>
      <Icon type="right" style={{fontSize: 12, marginLeft: 16, marginTop: 8}} />
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
        {index === upstreamsKeys.length - 1 && (
          <Button onClick={() => upstreamsAdd(index)}>
            Add
          </Button>
        )}
        {index !== upstreamsKeys.length - 1 && (
          <Button onClick={() => upstreamsRemove(k)}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));

	return (
    <>
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
      <FormItemLabel name="Secrets" />
      <Form.Item>
        {getFieldDecorator("secrets", {})(
          <Select placeholder="Select secrets to be applied" style={{width: 410}}>
            <Option value="1">Secret 1</Option>
          </Select>
        )}
      </Form.Item>
      <FormItemLabel name="Whitelist" description="Only those services that are whitelisted can access you" />
      {formItemsWhite}
      <FormItemLabel name="Upstreams" description="The upstream servces that you can access" />
      {formItemsUpstreams}
    </>                  
	);
}
const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(Deployment);
export default WrappedNormalLoginForm;