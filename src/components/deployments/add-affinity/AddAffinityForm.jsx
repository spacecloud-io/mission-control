import React from "react";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { Form, Affix } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Modal,
  Input,
  Row,
  Col,
  Select,
  Button,
  InputNumber,
  Slider,
  Tooltip
} from "antd";
import ConditionalFormBlock from "../../conditional-form-block/ConditionalFormBlock"
import { generateId } from "../../../utils";

const { Option } = Select;

const AddAffinityForm = props => {
  const { initialValues } = props;
  const [form] = Form.useForm();
  const formInitialValues = {
    type: initialValues ? initialValues.type : "service",
    weight: initialValues ? initialValues.weight : 0,
    operator: initialValues ? initialValues.operator : "preferred",
    topologyKey: initialValues ? initialValues.topologyKey : "kubernetes.io/hostname",
    projects: initialValues ? initialValues.projects : [props.projectId],
    matchExpressions: initialValues ? initialValues.matchExpressions : [{ key: "", operator: "In", values: undefined }]
  }

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      const operation = initialValues ? "edit" : "add";
      values.id = operation === "edit" ? initialValues.id : generateId();
      values.matchExpressions = values.matchExpressions.map(obj => Object.assign({}, obj, {
        attribute: "label",
        values: obj.operator === "Exists" || obj.operator === "DoesNotExist" ? [] : obj.values
      }))
      props.handleSubmit(values, operation)
      props.handleCancel()
    });
  };

  const modalProps = {
    visible: props.visible,
    width: 900,
    okText: initialValues ? "Save" : "Add",
    title: initialValues ? "Update Affinity" : "Add Affinity",
    onOk: handleSubmitClick,
    onCancel: props.handleCancel
  };

  const WeightSlider = ({ value, onChange }) => (
    <Row>
      <Col span={12}>
        <Slider
          min={-100}
          max={100}
          marks={{
            [-100]: { label: "Anti affinity", style: { transform: "translateX(0%)" } },
            100: { label: "Affinity", style: { transform: "translateX(-100%)" } },
          }}
          onChange={(val) => onChange(val)}
          value={value}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={-100}
          max={100}
          style={{ margin: '0 16px' }}
          value={value}
          onChange={(val) => onChange(val)}
        />
      </Col>
    </Row>
  )

  return (
    <div>
      <Modal {...modalProps}>
        <Form layout="vertical" form={form} initialValues={formInitialValues}>
          <React.Fragment>
            <FormItemLabel name="Type" />
            <Form.Item name="type" rules={[{ required: true, message: "Please select type!" }]}>
              <Select placeholder="Type" style={{ width: '50%' }}>
                <Select.Option value="node">Node</Select.Option>
                <Select.Option value="service">Service</Select.Option>
              </Select>
            </Form.Item>
            <FormItemLabel name="Weight" />
            <Form.Item name="weight" rules={[{ required: true, message: "Please enter weight!" }]}>
              <WeightSlider />
            </Form.Item>
            <FormItemLabel name="Operator" />
            <Form.Item name="operator" rules={[{ required: true, message: "Please select operator!" }]}>
              <Select placeholder="Operator" style={{ width: '50%' }}>
                <Select.Option value="preferred">Preferred</Select.Option>
                <Select.Option value="required">Required</Select.Option>
              </Select>
            </Form.Item>
            <ConditionalFormBlock dependency="type" condition={() => form.getFieldValue("type") === "service"}>
              <FormItemLabel name="Topology key" />
              <Form.Item name="topologyKey" rules={[{ required: true, message: "Please enter topology key!" }]}>
                <Input placeholder="Topology key" style={{ width: '50%' }} />
              </Form.Item>
              <FormItemLabel name="Target service projects" />
              <Form.Item
                name="projects"
                rules={[{ required: true, message: "Please enter value!" }]}
              >
                <Select
                  mode="tags"
                  placeholder="Projects"
                >
                  {props.projects.map(val => <Option key={val}>{val}</Option>)}
                </Select>
              </Form.Item>
            </ConditionalFormBlock>
            <FormItemLabel name="Match expressions" />
            <Form.List name="matchExpressions">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map(field => (
                      <Row key={field} gutter={5}>
                        <Col span={6}>
                          <FormItemLabel name="Key" />
                          <Form.Item
                            {...field}
                            name={[field.name, 'key']}
                            fieldKey={[field.fieldKey, 'key']}
                            rules={[{ required: true, message: "Please enter value!" }]}
                          >
                            <Input placeholder="Key" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <FormItemLabel name="Operator" />
                          <Form.Item noStyle shouldUpdate={true}>
                            {
                              () => {
                                const affinityType = form.getFieldValue("type")
                                return (
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'operator']}
                                    fieldKey={[field.fieldKey, 'operator']}
                                    rules={[{ required: true, message: "Please enter value!" }]}
                                  >
                                    <Select placeholder="Operator">
                                      <Select.Option value="In">In</Select.Option>
                                      <Select.Option value="NotIn">NotIn</Select.Option>
                                      {affinityType === "node" && (
                                        <React.Fragment>
                                          <Select.Option value="Gt">Gt</Select.Option>
                                          <Select.Option value="Lt">Lt</Select.Option>
                                        </React.Fragment>
                                      )}
                                      <Select.Option value="Exists">Exists</Select.Option>
                                      <Select.Option value="DoesNotExist">DoesNotExist</Select.Option>
                                    </Select>
                                  </Form.Item>
                                )
                              }
                            }
                          </Form.Item>
                        </Col>
                        <Form.Item noStyle shouldUpdate={true}>
                          {
                            () => {
                              const operator = form.getFieldValue(["matchExpressions", field.name, "operator"])
                              const showValues = operator !== "Exists" && operator !== "DoesNotExist"
                              return (
                                <Col span={9}>
                                  <FormItemLabel name="Values" />
                                  <Tooltip title={showValues ? "" : "Values are not applicable for this operator"}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'values']}
                                      fieldKey={[field.fieldKey, 'values']}
                                      rules={[{ required: showValues, message: "Please enter value!" }]}
                                    >
                                      <Select
                                        mode="tags"
                                        placeholder="Values"
                                        disabled={!showValues}
                                      >
                                      </Select>
                                    </Form.Item>
                                  </Tooltip>
                                </Col>
                              )
                            }
                          }
                        </Form.Item>
                        <Col span={3}>
                          {fields.length > 1 && (
                            <DeleteOutlined
                              onClick={() => {
                                remove(field.name);
                              }}
                              style={{ marginTop: 47 }}
                            />
                          )}
                        </Col>
                      </Row>
                    ))}

                    <Form.Item>
                      <Button
                        onClick={() => {
                          form.validateFields([...fields.map(obj => ["matchExpressions", obj.name, "key"]), ...fields.map(obj => ["matchExpressions", obj.name, "operator"]), ...fields.map(obj => ["matchExpressions", obj.name, "value"])])
                            .then(() => add())
                            .catch(ex => console.log("Exception", ex))
                        }}
                      >
                        <PlusOutlined /> Add match expression
                      </Button>
                    </Form.Item>
                  </div>
                );
              }}
            </Form.List>
          </React.Fragment>
        </Form>
      </Modal>
    </div >
  );
};

export default AddAffinityForm;
