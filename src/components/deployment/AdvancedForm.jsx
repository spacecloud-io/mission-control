import React from 'react';
import FormItemLabel from "../form-item-label/FormItemLabel";
import { Icon, 
         Form, 
         Select, 
         Button, 
         Input, 
         Card, 
         Row, 
         Col, 
         Radio, 
         Slider, 
         InputNumber,
         Tabs,
         Collapse, 
         Checkbox } from "antd";
const { Option } = Select;

let env = 1;
let white = 2;
let upstreams = 2;
let rules = 1;
const Deployment = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;

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
    if(getFieldValue(`env[${id}].name`) && getFieldValue(`env[${id}].value`)){
      const envKeys = getFieldValue("envKeys");
      const nextKeys = envKeys.concat(env++);
      setFieldsValue({
        envKeys: nextKeys
      });
    }
    else{
      alert("You need to fill current fields before adding new")
    }
  };

  getFieldDecorator("envKeys", { initialValue: initialKeys });
  const envKeys = getFieldValue("envKeys");
  const formItemsEnv = envKeys.map((k, index) => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`env[${k}].name`, {
          })(<Input style={{width: 150}} placeholder="Name"/>)}
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item style={{ marginRight: 30}}>
          {getFieldDecorator(`env[${k}].value`, {})
          (<Input placeholder="Value" />)}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index === envKeys.length - 1 && (
          <Button onClick={() => envAdd(index)}>
            <Icon type="plus" />Add
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
      alert("You need to fill current fields before adding new")
    }
  };
  
  getFieldDecorator("whiteKeys", { initialValue: [0,1] });
  const whiteKeys = getFieldValue("whiteKeys");
  const formItemsWhite = whiteKeys.map((k, index) => (
    <Row key={k}>
      <Col span={10}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`white[${k}].project_id`, {
            initialValue: k === 0 ? "project1" : ""
          })(<Input style={{width: 230}} placeholder="Project ID ( * to select all )"/>)}
        </Form.Item>
      <Icon type="right" style={{fontSize: 12, marginLeft: 16, marginTop: 8}} />
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30}}>
          {getFieldDecorator(`white[${k}].service_name`, {
            initialValue: k === 0 ? "All services" : ""
          })
          (<Input style={{width: 230}} placeholder="Service Name ( * to select all )" />)}
        </Form.Item>
      </Col>
      <Col span={3}>
        {index === whiteKeys.length - 1 && (
          <Button onClick={() => whiteAdd(index)}>
            <Icon type="plus" />Add
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
      alert("You need to fill current fields before adding new")
    }
  };

  getFieldDecorator("upstreamsKeys", { initialValue: [0,1] });
  const upstreamsKeys = getFieldValue("upstreamsKeys");
  const formItemsUpstreams = upstreamsKeys.map((k, index) => (
    <Row key={k}>
      <Col span={10}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`upstreams[${k}].project_id`, {
            initialValue: k === 0 ? "project1" : ""
          })(<Input style={{width: 230}} placeholder="Project ID ( * to select all )"/>)}
        </Form.Item>
      <Icon type="right" style={{fontSize: 12, marginLeft: 16, marginTop: 8}} />
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30}}>
          {getFieldDecorator(`upstreams[${k}].service_name`, {
            initialValue: k === 0 ? "All services" : ""
          }
          )
          (<Input style={{width: 230}} placeholder="Service Name ( * to select all )" />)}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index === upstreamsKeys.length - 1 && (
          <Button onClick={() => upstreamsAdd(index)}>
            <Icon type="plus" />Add
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


  //EXPOSE RULES
  const rulesRemove = k => {
    const rulesKeys = getFieldValue("rulesKeys");
    if (rulesKeys.length === 1) {
      return;
    }

    setFieldsValue({
      rulesKeys: rulesKeys.filter(key => key !== k)
    });
  };

  const rulesAdd = (id) => {
    if(getFieldValue(`rules[${id}].path`) && getFieldValue(`rules[${id}].port`)){
      const rulesKeys = getFieldValue("rulesKeys");
      const nextKeys = rulesKeys.concat(rules++);
      setFieldsValue({
        rulesKeys: nextKeys
      });
    }
    else{
      alert("You need to fill current fields before adding new")
    }
  };

  getFieldDecorator("rulesKeys", { initialValue: initialKeys });
  const rulesKeys = getFieldValue("rulesKeys");
  const formItemsRules = rulesKeys.map((k, index) => (
    <Row key={k}>
      <Col span={4}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`rules[${k}].path`, {
          })(<Input style={{width: 100}} placeholder="Path"/>)}
        </Form.Item>
        </Col>
        <Col span={4}>
        <Form.Item >
          {getFieldDecorator(`rules[${k}].prefix`, {
            initialValue: "prefix"
          })
          (<Select style={{width: 80, marginLeft: -11}}>
            <Option value="prefix">Prefix</Option>
          </Select>)}
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item style={{marginLeft: -12}}>
          {getFieldDecorator(`rules[${k}].port`, {})
          (<Input style={{width: 100}} placeholder="Port" />)}
        </Form.Item>
      </Col>
      <Col span={7}>
        <Form.Item >
          {getFieldDecorator(`rules[${k}].rewrite`, {})
          (<Input style={{width: 180}} placeholder="Rewrite (optional)" />)}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index === rulesKeys.length - 1 && (
          <Button onClick={() => rulesAdd(index)}>
            <Icon type="plus" />Add
          </Button>
        )}
        {index !== rulesKeys.length - 1 && (
          <Button onClick={() => rulesRemove(k)}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));


	return (
    <>
      <FormItemLabel name="Environment variables" />
      {formItemsEnv}
      <FormItemLabel name="Secrets" />
      <Form.Item>
        {getFieldDecorator("secrets", {})(
          <Select placeholder="Select secrets to be applied" style={{width: 430}}>
            <Option value="1">Secret 1</Option>
          </Select>
        )}
      </Form.Item>
      <FormItemLabel name="Whitelist" description="Only those services that are whitelisted can access you" />
      {formItemsWhite}
      <FormItemLabel name="Upstreams" description="The upstream servces that you can access" />
      {formItemsUpstreams}
      <FormItemLabel name="Expose Rules" />
      {formItemsRules}
    </>                  
	);
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(Deployment);

export default WrappedNormalLoginForm;
