import React, { useState } from "react";
import { Modal, Form, Input, Select, Checkbox, Row, Col, Icon, Button, message } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";
import { notify } from "../../utils";
const { Option } = Select;

let target = 1;

const RoutingRule = props => {
  const { getFieldDecorator, getFieldValue, setFieldsValue, validateFields } = props.form;
  const initialValues = props.initialValues;
  const children = [];
  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        delete values["allowSpecificHosts"];
        delete values["allowSpecificMethods"];
        delete values["performRewrite"];
        delete values["targetKeys"];
        if (!values.allowedHosts) values.allowedHosts = ["*"]
        if (!values.allowedMethods) values.allowedMethods = ["*"]
        values.targets = values.targets.map(o => Object.assign({}, o, { weight: Number(o.weight) }))
        const weightSum = values.targets.reduce((prev, curr) => prev + curr.weight, 0)
        if (weightSum !== 100) {
          message.error("Sum of all the target weights should be 100")
          return
        }
        props.handleSubmit(values).then(() => {
          notify("success", "Success", "Saved routing config successfully");
          props.handleCancel();
        });
      }
    });
  };

  const checkHost = (host) => {
    if (host.length === 1 && host[0] === "*") {
      return false;
    } else {
      return true;
    }
  }

  const checkMethod = (methods) => {
    if (methods.length === 0 || (methods.length === 1 && methods[0] === "*")) {
      return false;
    } else {
      return true;
    }
  }

  const removeTarget = k => {
    const targetKeys = getFieldValue("targetKeys");
    if (targetKeys.length === 1) {
      return;
    }

    setFieldsValue({
      targetKeys: targetKeys.filter(key => key !== k)
    });
  };

  const addTarget = () => {
    const schemeFields = targetKeys.map((k) => `targets[${k}].scheme`)
    const hostFields = targetKeys.map((k) => `targets[${k}].host`)
    const portFields = targetKeys.map((k) => `targets[${k}].port`)
    const weightFields = targetKeys.map((k) => `targets[${k}].weight`)
    validateFields([...schemeFields, ...hostFields, ...portFields, ...weightFields], (error) => {
      if (!error) {
        const targetKeys = getFieldValue("targetKeys");
        const nextKeys = targetKeys.concat(target++);
        setFieldsValue({
          targetKeys: nextKeys
        });
      }
    })
  };

  getFieldDecorator("targetKeys", { initialValue: initialValues ? initialValues.targets.map((_, i) => i) : [0] });
  const targetKeys = getFieldValue("targetKeys");
  const targetsFormItems = targetKeys.map((k, index) => (
    <div>
      <Row key={k} gutter={8}>
        <Col span={3}>
          <Form.Item style={{ marginBottom: 0 }} >
            {getFieldDecorator(`targets[${k}].scheme`, {
              initialValue:
                initialValues && initialValues.targets[k]
                  ? initialValues.targets[k].scheme
                  : "http"
            })(
              <Select style={{ width: "100%" }}>
                <Option value="http">HTTP</Option>
                <Option value="https">HTTPS</Option>
              </Select>
            )}
          </Form.Item>
          <br />
        </Col>
        <Col span={8}>
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`targets[${k}].host`, {
              rules: [
                {
                  required: true,
                  message: "Host is required!"
                }
              ],
              initialValue:
                initialValues && initialValues.targets[k]
                  ? initialValues.targets[k].host
                  : ""
            })(
              <Input
                placeholder="Service Host"
                style={{ width: "100%" }}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`targets[${k}].port`, {
              rules: [
                {
                  validator: (_, value, cb) => {
                    if (!value) {
                      cb("Please provide a port value!")
                      return
                    }
                    if (!Number.isInteger(Number(value))) {
                      cb("Not a valid port value")
                    }
                    cb()
                  }
                }
              ],
              initialValue:
                initialValues && initialValues.targets[k]
                  ? initialValues.targets[k].port
                  : ""
            })(
              <Input
                placeholder="Port"
                style={{ width: "100%" }}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`targets[${k}].weight`, {
              rules: [
                {
                  validator: (_, value, cb) => {
                    if (!value) {
                      cb("Please provide a weight!")
                      return
                    }
                    const weightVal = Number(value)
                    if (!Number.isInteger(weightVal) || !(weightVal > 0 && weightVal <= 100)) {
                      cb("Weight should be a number between 1 to 100")
                    }
                    cb()
                  }
                }
              ],
              initialValue:
                initialValues && initialValues.targets[k]
                  ? initialValues.targets[k].weight
                  : ""
            })(
              <Input
                placeholder="Weight between 1 to 100"
                style={{ width: "100%" }}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={4}>
          {index > 0 && (
            <Button onClick={() => removeTarget(k)}>
              <Icon type="delete" />
            </Button>
          )}
        </Col>
      </Row>
      {index === targetKeys.length - 1 && (
        <Button
          onClick={() => addTarget(index)}
        >
          <Icon type="plus" />
          Add another target
        </Button>
      )}
    </div>
  ));

  return (
    <div>
      <Modal
        title={`${props.initialValues ? "Edit" : "Add"} Routing Rules`}
        visible={true}
        width={1200}
        okText={props.initialValues ? "Save" : "Add"}
        onCancel={props.handleCancel}
        onOk={handleSubmitClick}
      >
        <Form layout="vertical" onSubmit={handleSubmitClick}>
          <FormItemLabel name="Route matching type" />
          <Form.Item>
            {getFieldDecorator("routeType", {
              rules: [{ required: true, message: "Route type is required" }],
              initialValue: initialValues ? initialValues.routeType : "prefix"
            })(
              <Select style={{ width: 200 }}>
                <Select.Option value="prefix">Prefix Match</Select.Option>
                <Select.Option value="exact">Exact Match</Select.Option>
              </Select>
            )}
          </Form.Item>
          {getFieldValue("routeType") === "exact" ? (
            <div>
              <FormItemLabel name="URL" />
              <Form.Item>
                {getFieldDecorator("url", {
                  rules: [{ required: true, message: "Please provide URL" }],
                  initialValue: initialValues ? initialValues.url : ""
                })(
                  <Input placeholder="The exact URL of incoming request (eg:/v1/foo/bar)" />
                )}
              </Form.Item>
            </div>
          ) : (
              <div>
                <FormItemLabel name="Prefix" />
                <Form.Item>
                  {getFieldDecorator("url", {
                    rules: [{ required: true, message: "Please provide prefix" }],
                    initialValue: initialValues ? initialValues.url : ""
                  })(
                    <Input placeholder="Prefix for incoming request (eg:/v1/)" />
                  )}
                </Form.Item>
              </div>
            )}
          <FormItemLabel name="Rewrite" />
          <Form.Item>
            {getFieldDecorator("performRewrite", {
              valuePropName: "checked",
              initialValue:
                initialValues && initialValues.rewrite ? true : false
            })(
              <Checkbox>
                Rewrite incoming request URL to target service
              </Checkbox>
            )}
          </Form.Item>
          {getFieldValue("performRewrite") ? (
            <div>
              <FormItemLabel name="Rewrite URL" />
              <Form.Item>
                {getFieldDecorator("rewrite", {
                  rules: [{ required: true, message: "Please provide URL" }],
                  initialValue: initialValues ? initialValues.rewrite : ""
                })(
                  <Input placeholder="New Request URL that will override the incoming request " />
                )}
              </Form.Item>
            </div>
          ) : (
              ""
            )}
          <FormItemLabel name="Hosts" />
          <Form.Item>
            {getFieldDecorator("allowSpecificHosts", {
              valuePropName: "checked",
              initialValue:
                initialValues && checkHost(initialValues.allowedHosts)
                  ? true
                  : false
            })(<Checkbox>Allow traffic with specified hosts only</Checkbox>)}
          </Form.Item>
          {getFieldValue("allowSpecificHosts") ? (
            <div>
              <FormItemLabel name="Allowed hosts " />
              <Form.Item>
                {getFieldDecorator("allowedHosts", {
                  rules: [
                    {
                      required: true,
                      message: "Please enter the domain for the project"
                    }
                  ],
                  initialValue: initialValues && checkHost(initialValues.allowedHosts) ?
                    initialValues.allowedHosts : []
                })(
                  <Select
                    mode="tags"
                    placeholder="Add hosts that you want to allow for this route"
                    style={{ width: "100%" }}
                    tokenSeparators={[","]}
                  >
                    {children}
                  </Select>
                )}
              </Form.Item>
            </div>
          ) : (
              ""
            )}
          <FormItemLabel name="Methods" />
          <Form.Item>
            {getFieldDecorator("allowSpecificMethods", {
              valuePropName: "checked",
              initialValue:
                initialValues && checkMethod(initialValues.allowedMethods)
                  ? true
                  : false
            })(<Checkbox>Allow traffic with specified methods only</Checkbox>)}
          </Form.Item>
          {getFieldValue("allowSpecificMethods") ? (
            <div>
              <FormItemLabel name="Allowed methods " />
              <Form.Item>
                {getFieldDecorator("allowedMethods", {
                  rules: [
                    {
                      required: true,
                      message: "Please enter the domain for the project"
                    }
                  ],
                  initialValue: initialValues && checkMethod(initialValues.allowedMethods) ?
                    initialValues.allowedMethods : []
                })(
                  <Select
                    mode="tags"
                    placeholder="Add hosts that you want to allow for this route"
                    style={{ width: "100%" }}
                    tokenSeparators={[","]}
                  >
                    <Option key="GET">GET</Option>
                    <Option key="POST">POST</Option>
                    <Option key="PUT">PUT</Option>
                    <Option key="PATCH">PATCH</Option>
                    <Option key="DELETE">DELETE</Option>
                    <Option key="OPTIONS">OPTIONS</Option>
                    <Option key="HEAD">HEAD</Option>
                    <Option key="CONNECT">CONNECT</Option>
                    <Option key="TRACE">TRACE</Option>
                  </Select>
                )}
              </Form.Item>
            </div>
          ) : (
              ""
            )}
          <FormItemLabel name="Targets" />
          <React.Fragment>{targetsFormItems}</React.Fragment>
        </Form>
      </Modal>
    </div>
  );
};

export default Form.create({})(RoutingRule);
