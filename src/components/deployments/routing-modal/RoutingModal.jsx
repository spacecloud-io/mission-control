import React from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Modal, Input, Select, Row, Col, Button, message, Form } from "antd";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { notify } from "../../../utils";
import ConditionalFormBlock from "../../conditional-form-block/ConditionalFormBlock";
const { Option } = Select;

const RoutingRule = props => {
  const [form] = Form.useForm();
  const initialValues = props.initialValues;
  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      values.targets = values.targets.map(o => Object.assign({}, o, { weight: Number(o.weight), port: Number(o.port) }))
      const weightSum = values.targets.reduce((prev, curr) => prev + curr.weight, 0)
      if (weightSum !== 100) {
        message.error("Sum of all the target weights should be 100")
        return
      }
      values.port = Number(values.port)
      props.handleSubmit(values).then(() => props.handleCancel());
    });
  };

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
        <Form layout="vertical" form={form}
          initialValues={{
            port: initialValues ? initialValues.port : "",
            targets: initialValues ? initialValues.targets : [{ type: "version", version: "", host: "", port: "", weight: "" }]
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
                    {fields.map((field) => (
                      <Row key={field} gutter={8}>
                        <Col span={5}>
                          <Form.Item
                            key={[field.name, "type"]}
                            name={[field.name, "type"]}
                            validateTrigger={["onChange", "onBlur"]}>
                            <Select style={{ width: "100%" }}>
                              <Option value="version">Internal service version</Option>
                              <Option value="external">External host</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["targets", field.name, "type"]) === "version"}>
                          <Col span={4}>
                            <Form.Item
                              validateTrigger={["onChange", "onBlur"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Version is required!"
                                }
                              ]}
                              name={[field.name, "version"]}
                              key={[field.name, "version"]}
                            >
                              <Input
                                placeholder="Service version"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                        </ConditionalFormBlock>
                        <ConditionalFormBlock shouldUpdate={true} condition={() => form.getFieldValue(["targets", field.name, "type"]) === "external"}>
                          <Col span={8}>
                            <Form.Item
                              validateTrigger={["onChange", "onBlur"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Host is required!"
                                }
                              ]}
                              name={[field.name, "host"]}
                              key={[field.name, "host"]}
                            >
                              <Input
                                placeholder="Host"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                        </ConditionalFormBlock>
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
                            name={[field.name, "port"]}
                            key={[field.name, "port"]}
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
                            name={[field.name, "weight"]}
                            key={[field.name, "weight"]}
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
                    ))}
                    <Form.Item>
                      <Button
                        onClick={() => {
                          const fieldKeys = [
                            ...fields.map(obj => ["targets", obj.name, "type"]),
                            ...fields.map(obj => ["targets", obj.name, "version"]),
                            ...fields.map(obj => ["targets", obj.name, "host"]),
                            ...fields.map(obj => ["targets", obj.name, "port"]),
                            ...fields.map(obj => ["targets", obj.name, "weight"])
                          ]
                          form.validateFields(fieldKeys)
                            .then(() => add({ type: "version" }))
                            .catch(ex => console.log("Exception", ex))
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
