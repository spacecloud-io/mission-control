import React, { useState } from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Modal, Input, Select, Checkbox, Row, Col, Button, message, Form } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";
import { notify } from "../../utils";
const { Option } = Select;

let target = 1;

const RoutingRule = props => {
  const [form] = Form.useForm();
  const [routeType, setRouteType] = useState();
  const [performRewrite, setPerformRewrite] = useState();
  const [allowSpecificHosts, setAllowSpecificHosts] = useState();
  const [allowSpecificMethods, setAllowSpecificMethods] = useState();

  const initialValues = props.initialValues;
  const children = [];
  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      console.log(values);
      delete values["allowSpecificHosts"];
      delete values["allowSpecificMethods"];
      delete values["performRewrite"];
      delete values["targetKeys"];
      if (!values.allowedHosts) values.allowedHosts = ["*"]
      if (!values.allowedMethods) values.allowedMethods = ["*"]
      values.targets = values.targets.map(o => Object.assign({}, o, { weight: Number(o.weight), port: Number(o.port) }))
      const weightSum = values.targets.reduce((prev, curr) => prev + curr.weight, 0)
      if (weightSum !== 100) {
        message.error("Sum of all the target weights should be 100")
        return
      }
      props.handleSubmit(values).then(() => {
        notify("success", "Success", "Saved routing config successfully");
        props.handleCancel();
      });
    })
  };
  

  const handleChangedValues = ({ routeType, performRewrite, allowSpecificHosts, allowSpecificMethods}) => {
    setRouteType(routeType);
    setPerformRewrite(performRewrite);
    setAllowSpecificHosts(allowSpecificHosts);
    setAllowSpecificMethods(allowSpecificMethods);
  }

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

  // const removeTarget = k => {
  //   const targetKeys = form.getFieldValue("targetKeys");
  //   if (targetKeys.length === 1) {
  //     return;
  //   }

  //   form.setFieldsValue({
  //     targetKeys: targetKeys.filter(key => key !== k)
  //   });
  // };

  // const addTarget = () => {
  //   const schemeFields = targetKeys.map((k) => `targets[${k}].scheme`)
  //   const hostFields = targetKeys.map((k) => `targets[${k}].host`)
  //   const portFields = targetKeys.map((k) => `targets[${k}].port`)
  //   const weightFields = targetKeys.map((k) => `targets[${k}].weight`)
  //   form.validateFields([...schemeFields, ...hostFields, ...portFields, ...weightFields], (error) => {
  //     if (!error) {
  //       const targetKeys = form.getFieldValue("targetKeys");
  //       const nextKeys = targetKeys.concat(target++);
  //       form.setFieldsValue({
  //         targetKeys: nextKeys
  //       });
  //     }
  //   })
  // };

  // form.getFieldDecorator("targetKeys", { initialValue: initialValues ? initialValues.targets.map((_, i) => i) : [0] });
  // const targetKeys = form.getFieldValue("targetKeys");
  // const targetsFormItems = targetKeys.map((k, index) => (
  //   <div>
  //     <Row key={k} gutter={8}>
  //       <Col span={3}>
  //         <Form.Item name={`targets[${k}].scheme`} style={{ marginBottom: 0 }} >
  //             {/* initialValue:
  //               initialValues && initialValues.targets[k]
  //                 ? initialValues.targets[k].scheme
  //                 : "http" */}
  //           (
  //             <Select style={{ width: "100%" }}>
  //               <Option value="http">HTTP</Option>
  //               <Option value="https">HTTPS</Option>
  //             </Select>
  //           )
  //         </Form.Item>
  //         <br />
  //       </Col>
  //       <Col span={8}>
  //         <Form.Item name={`targets[${k}].host`} style={{ marginBottom: 0 }} rules={[
  //               {
  //                 required: true,
  //                 message: "Host is required!"
  //               }
  //             ]}>
  //             {/* initialValue:
  //               initialValues && initialValues.targets[k]
  //                 ? initialValues.targets[k].host
  //                 : "" */}
  //           (
  //             <Input
  //               placeholder="Service Host"
  //               style={{ width: "100%" }}
  //             />
  //           )
  //         </Form.Item>
  //       </Col>
  //       <Col span={4}>
  //         <Form.Item name={`targets[${k}].port`} style={{ marginBottom: 0 }} rules={[
  //               {
  //                 validator: (_, value, cb) => {
  //                   if (!value) {
  //                     cb("Please provide a port value!")
  //                     return
  //                   }
  //                   if (!Number.isInteger(Number(value))) {
  //                     cb("Not a valid port value")
  //                     return
  //                   }
  //                   cb()
  //                 }
  //               }
  //             ]}>
  //             {/* initialValue:
  //               initialValues && initialValues.targets[k]
  //                 ? initialValues.targets[k].port
  //                 : "" */}
  //           (
  //             <Input
  //               placeholder="Port"
  //               style={{ width: "100%" }}
  //             />
  //           )
  //         </Form.Item>
  //       </Col>
  //       <Col span={5}>
  //         <Form.Item name={`targets[${k}].weight`} style={{ marginBottom: 0 }} rules={[
  //               {
  //                 validator: (_, value, cb) => {
  //                   if (!value) {
  //                     cb("Please provide a weight!")
  //                     return
  //                   }
  //                   const weightVal = Number(value)
  //                   if (!Number.isInteger(weightVal) || !(weightVal > 0 && weightVal <= 100)) {
  //                     cb("Weight should be a number between 1 to 100")
  //                     return
  //                   }
  //                   cb()
  //                 }
  //               }
  //             ]}>
  //             {/* initialValue:
  //               initialValues && initialValues.targets[k]
  //                 ? initialValues.targets[k].weight
  //                 : "" */}
  //           (
  //             <Input
  //               placeholder="Weight between 1 to 100"
  //               style={{ width: "100%" }}
  //             />
  //           )
  //         </Form.Item>
  //       </Col>
  //       <Col span={4}>
  //         {index > 0 && (
  //           <Button onClick={() => removeTarget(k)}>
  //             <DeleteOutlined />
  //           </Button>
  //         )}
  //       </Col>
  //     </Row>
  //     {index === targetKeys.length - 1 && (
  //       <Button
  //         onClick={() => addTarget(index)}
  //       >
  //         <PlusOutlined />
  //         Add another target
  //       </Button>
  //     )}
  //   </div>
  // ));

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
        <Form layout="vertical" form={form} onValuesChange={handleChangedValues} onFinish={handleSubmitClick}
          initialValues={{
            "routeType": initialValues ? initialValues.routeType : "prefix", "url": initialValues ? initialValues.url : "",
            "url": initialValues ? initialValues.url : "", "performRewrite": initialValues && initialValues.rewrite ? true : false,
            "rewrite": initialValues ? initialValues.rewrite : "", "allowSpecificHosts": initialValues && checkHost(initialValues.allowedHosts)
              ? true : false, "allowedHosts": initialValues && checkHost(initialValues.allowedHosts) ? initialValues.allowedHosts : [],
            "allowSpecificMethods": initialValues && checkMethod(initialValues.allowedMethods) ? true : false,
            "allowedMethods": initialValues && checkMethod(initialValues.allowedMethods) ? initialValues.allowedMethods : [],
            targets: [{
              scheme: initialValues && initialValues.targets ? initialValues.targets.scheme : "http",
              host: initialValues && initialValues.targets ? initialValues.targets.host : "",
              port: initialValues && initialValues.targets ? initialValues.targets.port : "",
              weight: initialValues && initialValues.targets ? initialValues.targets.weight : ""
            }]
          }}>
          <FormItemLabel name="Route matching type" />
          <Form.Item name="routeType" rules={[{ required: true, message: "Route type is required" }]}>
              <Select style={{ width: 200 }}>
              <Select.Option value="prefix">Prefix Match</Select.Option>
              <Select.Option value="exact">Exact Match</Select.Option>
            </Select>
          </Form.Item>
          {routeType === "exact" ? (
            <div>
              <FormItemLabel name="URL" />
              <Form.Item name="url" rules={[{ required: true, message: "Please provide URL" }]}>
                  <Input placeholder="The exact URL of incoming request (eg:/v1/foo/bar)" />
              </Form.Item>
            </div>
          ) : (
              <div>
                <FormItemLabel name="Prefix" />
                <Form.Item name="url" rules={[{ required: true, message: "Please provide prefix" }]}>
                    <Input placeholder="Prefix for incoming request (eg:/v1/)" />
                </Form.Item>
              </div>
            )}
          <FormItemLabel name="Rewrite" />
          <Form.Item name="performRewrite" valuePropName="checked">
              <Checkbox>
              Rewrite incoming request URL to target service
              </Checkbox>
          </Form.Item>
          {performRewrite ? (
            <div>
              <FormItemLabel name="Rewrite URL" />
              <Form.Item name="rewrite" rules={[{ required: true, message: "Please provide URL" }]}>
                  <Input placeholder="New Request URL that will override the incoming request " />
              </Form.Item>
            </div>
          ) : (
              ""
            )}
          <FormItemLabel name="Hosts" />
          <Form.Item name="allowSpecificHosts" valuePropName="checked">
            <Checkbox>Allow traffic with specified hosts only</Checkbox>
          </Form.Item>
          {allowSpecificHosts ? (
            <div>
              <FormItemLabel name="Allowed hosts " />
              <Form.Item name="allowedHosts" rules={[
                {
                  required: true,
                  message: "Please enter the domain for the project"
                }
              ]}>
                  <Select
                  mode="tags"
                  placeholder="Add hosts that you want to allow for this route"
                  style={{ width: "100%" }}
                  tokenSeparators={[","]}
                >
                  {children}
                </Select>
              </Form.Item>
            </div>
          ) : (
              ""
            )}
          <FormItemLabel name="Methods" />
          <Form.Item name="allowSpecificMethods" valuePropName="checked">
            <Checkbox>Allow traffic with specified methods only</Checkbox>
          </Form.Item>
          {allowSpecificMethods ? (
            <div>
              <FormItemLabel name="Allowed methods " />
              <Form.Item name="allowedMethods" rules={[
                {
                  required: true,
                  message: "Please enter the domain for the project"
                }
              ]}>
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
              </Form.Item>
            </div>
          ) : (
              ""
            )}
          <FormItemLabel name="Targets" />
          <React.Fragment>
            <Form.List name="targets" style={{ display: "inline-block" }}>
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map((field, index) => (
                      <React.Fragment>
                        <Row key={fields} gutter={8}>
                          <Col span={3}>
                            <Form.Item name={[field.key.toString(), "scheme"]}
                              style={{ marginBottom: 0 }}
                              validateTrigger={["onChange", "onBlur"]}
                              rules={[{ required: true, message: "Please enter key!" }]}>
                              <Select style={{ width: "100%" }}>
                                <Option value="http">HTTP</Option>
                                <Option value="https">HTTPS</Option>
                              </Select>
                            </Form.Item>
                            <br />
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              validateTrigger={["onChange", "onBlur"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Host is required!"
                                }
                              ]}
                              name={[field.key.toString(), "host"]}
                            >
                              <Input
                                placeholder="Service Host"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              validateTrigger={["onChange", "onBlur"]}
                              rules={[
                                {
                                  validator: (_, value, cb) => {
                                    if (!value) {
                                      cb("Please provide a port value!")
                                      return
                                    }
                                    if (!Number.isInteger(Number(value))) {
                                      cb("Not a valid port value")
                                      return
                                    }
                                    cb()
                                  }
                                }
                              ]}
                              name={[field.key.toString(), "port"]}
                            >
                              <Input
                                placeholder="Port"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={5}>
                            <Form.Item
                              validateTrigger={["onChange", "onBlur"]}
                              rules={[
                                {
                                  validator: (_, value, cb) => {
                                    if (!value) {
                                      cb("Please provide a weight!")
                                      return
                                    }
                                    const weightVal = Number(value)
                                    if (!Number.isInteger(weightVal) || !(weightVal > 0 && weightVal <= 100)) {
                                      cb("Weight should be a number between 1 to 100")
                                      return
                                    }
                                    cb()
                                  }
                                }
                              ]}
                              name={[field.key.toString(), "weight"]}
                            >
                              <Input
                                placeholder="Weight between 1 to 100"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            {fields.length > 1 ? (
                              <DeleteOutlined
                                style={{ margin: "0 8px" }}
                                onClick={() => {
                                  remove(field.name);
                                }}
                              />
                            ) : null}
                          </Col>
                        </Row>
                      </React.Fragment>
                    ))}
                    <Form.Item>
                      <Button
                        onClick={() => {
                          add();
                        }}
                        style={{ marginTop: -10 }}
                      >
                        <PlusOutlined /> Add another target
                          </Button>
                    </Form.Item>
                  </div>
                );
              }}
            </Form.List>
          </React.Fragment>
        </Form>
      </Modal>
    </div>
  );
};

export default RoutingRule;
