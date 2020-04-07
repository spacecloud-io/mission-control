import React from "react";
import { Modal, Form, Input, Select, Checkbox, Row, Col, Icon, Button, message } from "antd";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { notify } from "../../../utils";
const { Option } = Select;

let target = 1;

const RoutingRule = props => {
  const { getFieldDecorator, getFieldValue, setFieldsValue, validateFields } = props.form;
  const initialValues = props.initialValues;
  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
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
      }
    });
  };

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
    const typeFields = targetKeys.map((k) => `targets[${k}].type`)
    const hostFields = targetKeys.map((k) => `targets[${k}].host`)
    const versionFields = targetKeys.map((k) => `targets[${k}].version`)
    const portFields = targetKeys.map((k) => `targets[${k}].port`)
    const weightFields = targetKeys.map((k) => `targets[${k}].weight`)
    validateFields([...typeFields, ...hostFields, ...portFields, ...weightFields, ...versionFields], (error) => {
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
        <Col span={5}>
          <Form.Item style={{ marginBottom: 0 }} >
            {getFieldDecorator(`targets[${k}].type`, {
              initialValue:
                initialValues && initialValues.targets[k]
                  ? initialValues.targets[k].type
                  : "version"
            })(
              <Select style={{ width: "100%" }}>
                <Option value="version">Internal service version</Option>
                <Option value="external">External host</Option>
              </Select>
            )}
          </Form.Item>
          <br />
        </Col>
        {getFieldValue(`targets[${k}].type`) === "version" &&
          <Col span={4}>
            <Form.Item style={{ marginBottom: 0 }}>
              {getFieldDecorator(`targets[${k}].version`, {
                rules: [
                  {
                    required: true,
                    message: "Version is required!"
                  }
                ],
                initialValue:
                  initialValues && initialValues.targets[k]
                    ? initialValues.targets[k].version
                    : ""
              })(
                <Input
                  placeholder="Service version"
                  style={{ width: "100%" }}
                />
              )}
            </Form.Item>
          </Col>}
        {getFieldValue(`targets[${k}].type`) === "external" &&
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
                  placeholder="Host"
                  style={{ width: "100%" }}
                />
              )}
            </Form.Item>
          </Col>}
        <Col span={3}>
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
                      return
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
        <Col span={4}>
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
                      return
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
          <FormItemLabel name="Port" />
          <Form.Item>
            {getFieldDecorator("port", {
              rules: [
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
              ],
              initialValue: initialValues ? initialValues.port : ""
            })(
              <Input placeholder="Service port (eg: 8080)" style={{ width: 300 }} />
            )}
          </Form.Item>
          <FormItemLabel name="Targets" />
          <React.Fragment>{targetsFormItems}</React.Fragment>
        </Form>
      </Modal>
    </div>
  );
};

export default Form.create({})(RoutingRule);
