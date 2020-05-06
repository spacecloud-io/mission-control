import React, { useState } from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Modal, Input, Select, Checkbox, Row, Col, Button, message, Form } from "antd";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { notify } from "../../../utils";
const { Option } = Select;

let target = 1;

const RoutingRule = props => {
  // const { getFieldDecorator, getFieldValue, setFieldsValue, validateFields } = props.form;
  const [form] = Form.useForm();
  const [targetKeys, setTargetKeys] = useState();
  const [type, setType] = useState();
  const initialValues = props.initialValues;
  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      delete values["targetKeys"];
      values.targets = values.targets.map(o => Object.assign({}, o, { weight: Number(o.weight), port: Number(o.port) }))
      const weightSum = values.targets.reduce((prev, curr) => prev + curr.weight, 0)
      if (weightSum !== 100) {
        message.error("Sum of all the target weights should be 100")
        return
      }
      values.port = Number(values.port)
      props.handleSubmit(values).then(() => {
        notify("success", "Success", "Saved routing config successfully");
        props.handleCancel();
      });
    });
  };

  const handleChangedValues = ({ targetKeys, targets }) => {
    setTargetKeys(targetKeys);
    console.log(targets);
    setType(type)
  }

  const removeTarget = k => {
    // const targetKeys = getFieldValue("targetKeys");
    if (targetKeys.length === 1) {
      return;
    }

    form.setFieldsValue({
      targetKeys: targetKeys.filter(key => key !== k)
    });
  };

  const addTarget = () => {
    const typeFields = targetKeys.map((k) => `targets[${k}].type`)
    const hostFields = targetKeys.map((k) => `targets[${k}].host`)
    const versionFields = targetKeys.map((k) => `targets[${k}].version`)
    const portFields = targetKeys.map((k) => `targets[${k}].port`)
    const weightFields = targetKeys.map((k) => `targets[${k}].weight`)
    form.validateFields([...typeFields, ...hostFields, ...portFields, ...weightFields, ...versionFields], (error) => {
      if (!error) {
        const targetKeys = form.getFieldValue("targetKeys");
        const nextKeys = targetKeys.concat(target++);
        form.setFieldsValue({
          targetKeys: nextKeys
        });
      }
    })
  };

  // const targetKeys = getFieldValue("targetKeys");
  // const targetsFormItems = targetKeys.map((k, index) => (
  //   <div>
  //     <Row key={k} gutter={8}>
  //       <Col span={5}>






  //         <Form.Item name={`targets[${k}].type`} style={{ marginBottom: 0 }} >
  //             {/* initialValue:
  //               initialValues && initialValues.targets[k]
  //                 ? initialValues.targets[k].type
  //                 : "version" */}
  //             <Select style={{ width: "100%" }}>
  //               <Option value="version">Internal service version</Option>
  //               <Option value="external">External host</Option>
  //             </Select>
  //         </Form.Item>
  //         <br />
  //       </Col>
  //       {form.getFieldValue(`targets[${k}].type`) === "version" &&
  //         <Col span={4}>
  //           <Form.Item name={`targets[${k}].version`} style={{ marginBottom: 0 }} rules={[
  //                 {
  //                   required: true,
  //                   message: "Version is required!"
  //                 }
  //               ]}>
  //               {/* initialValue:
  //                 initialValues && initialValues.targets[k]
  //                   ? initialValues.targets[k].version
  //                   : "" */}
  //               <Input
  //                 placeholder="Service version"
  //                 style={{ width: "100%" }}
  //               />
  //           </Form.Item>
  //         </Col>}
  //       {form.getFieldValue(`targets[${k}].type`) === "external" &&
  //         <Col span={8}>
  //           <Form.Item name={`targets[${k}].host`} style={{ marginBottom: 0 }} rules={[
  //                 {
  //                   required: true,
  //                   message: "Host is required!"
  //                 }
  //               ]}>
  //               {/* initialValue:
  //                 initialValues && initialValues.targets[k]
  //                   ? initialValues.targets[k].host
  //                   : "" */}
  //               <Input
  //                 placeholder="Host"
  //                 style={{ width: "100%" }}
  //               />
  //           </Form.Item>
  //         </Col>}
  //       <Col span={3}>
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
  //             <Input
  //               placeholder="Port"
  //               style={{ width: "100%" }}
  //             />
  //         </Form.Item>
  //       </Col>
  //       <Col span={4}>
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
  //             <Input
  //               placeholder="Weight between 1 to 100"
  //               style={{ width: "100%" }}
  //             />
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
            port: initialValues ? initialValues.port : "",
            targets: [{
              type: initialValues && initialValues.targets
                ? initialValues.targets.type
                : "version",
              version: initialValues && initialValues.targets
                ? initialValues.targets.version
                : "",
              host: initialValues && initialValues.targets
                ? initialValues.targets.host
                : "",
              port: initialValues && initialValues.targets
                ? initialValues.targets.port
                : "",
              weight: initialValues && initialValues.targets
                ? initialValues.targets.weight
                : ""
            }]
          }}>
          <FormItemLabel name="Port" />
          <Form.Item name="port" rules={[
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
          ]}>
            <Input placeholder="Service port (eg: 8080)" style={{ width: 300 }} />
          </Form.Item>
          <FormItemLabel name="Targets" />
          <React.Fragment>

            <Form.List name="targets" >
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map((field, index) => (
                      <React.Fragment>
                        <Row key={field} gutter={8}>
                          <Col span={5}>
                            <Form.Item name={[field.key.toString(), "type"]} validateTrigger={["onChange", "onBlur"]}
                              style={{ marginBottom: 0 }}>
                              <Select style={{ width: "100%" }}>
                                <Option value="version">Internal service version</Option>
                                <Option value="external">External host</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          {type === "version" &&
                            <Col span={4}>
                              <Form.Item
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Version is required!"
                                  }
                                ]}
                                name={[field.key.toString(), "version"]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input
                                  placeholder="Service version"
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>}
                          {type === "external" &&
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
                                style={{ marginBottom: 0 }}
                              >
                                <Input
                                  placeholder="Host"
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>}
                          <Col span={3}>
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
                              style={{ marginBottom: 0 }}
                            >
                              <Input
                                placeholder="Port"
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
                              style={{ marginBottom: 0 }}
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
                        style={{ marginTop: 10 }}
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
