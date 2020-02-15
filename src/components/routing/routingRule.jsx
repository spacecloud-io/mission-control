import React, { useState } from "react";
import { Modal, Form, Input, Select, Checkbox } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";
import { notify } from "../../utils";

const RoutingRule = props => {
  const { getFieldDecorator, getFieldValue } = props.form;
  const initialValues = props.initialValues;
  const children = [];
  let re = /a-zA-Z/;
  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        delete values["allowSpecificHosts"];
        delete values["performRewrite"];
        if (!values.allowedHosts) values.allowedHosts = ["*"]
        props.handleSubmit(values).then(() => {
          notify("success", "Success", "Saved routing config successfully");
          props.handleCancel();
        });
      }
    });
  };

  const checkHost = (host) => {
    if(host.length === 1 && host[0] === "*"){
        return false;
    }else {
      return true;
    }
  }

  return (
    <div>
      <Modal
        title={`${props.initialValues ? "Edit" : "Add"} Routing Rules`}
        visible={true}
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
          <FormItemLabel name="Target Host" />
          <Form.Item>
            {getFieldDecorator("targetHost", {
              rules: [{ required: true, message: "Please provide target host" }],
              initialValue: initialValues ? initialValues.targetHost : ""
            })(<Input placeholder="Target host (eg: service1.project1.svc.cluster.local)" />)}
          </Form.Item>
          <FormItemLabel name="Target Port" />
          <Form.Item>
            {getFieldDecorator("targetPort", {
              rules: [{ 
                    validator: (_, value, cb) => {
                    if (!value) {
                      cb("Please provide target service port")
                      return
                    }
                    if (isNaN(value)) {
                      cb("Service name cannot contain strings!")
                    }
                    cb()
                  }
                }], initialValue: initialValues ? initialValues.targetPort : ""
            })(<Input placeholder="Target port (eg: 8080)" />)}
          </Form.Item>
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
            })(<Checkbox>Allow traffic from specified hosts only</Checkbox>)}
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
        </Form>
      </Modal>
    </div>
  );
};

export default Form.create({})(RoutingRule);
