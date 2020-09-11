import React from "react";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { Form, AutoComplete } from 'antd'
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ConditionalFormBlock from "../../conditional-form-block/ConditionalFormBlock";
import {
  Modal,
  Radio,
  Input,
  Row,
  Col,
  Select,
  Button,
  Collapse,
  InputNumber,
  Checkbox,
  Slider,
  Space
} from "antd";
const { Option } = Select;
const { Panel } = Collapse;

const AddTaskForm = props => {
  const { initialValues } = props;
  const [form] = Form.useForm();

  const formInitialValues = {}

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      props.handleSubmit(values)
      props.handleCancel()
    });
  };

  const modalProps = {
    className: "edit-item-modal",
    visible: props.visible,
    width: 720,
    okText: initialValues ? "Save" : "Add",
    title: initialValues ? "Update Task" : "Add task",
    onOk: handleSubmitClick,
    onCancel: props.handleCancel
  };

  const WeightSlider = ({ value, onChange }) => (
    <Row>
      <Col span={12}>
        <Slider
          min={-100}
          max={100}
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
                <Select.Option value="node">node</Select.Option>
                <Select.Option value="service">service</Select.Option>
              </Select>
            </Form.Item>
            <FormItemLabel name="Weight" />
            <Form.Item name="weight" rules={[{ required: true, message: "Please enter weight!" }]}>
              <WeightSlider />
            </Form.Item>
            <FormItemLabel name="Operator" />
            <Form.Item name="operator" rules={[{ required: true, message: "Please select operator!" }]}>
              <Select placeholder="Operator" style={{ width: '50%' }}>
                <Select.Option value="preferred">preferred</Select.Option>
                <Select.Option value="required">required</Select.Option>
              </Select>
            </Form.Item>
            <FormItemLabel name="Topology key" />
            <Form.Item name="TopologyKey" rules={[{ required: true, message: "Please enter topology key!" }]}>
              <Input placeholder="Topology key" style={{ width: '50%' }} />
            </Form.Item>
            <FormItemLabel name="Match expression" />
            <Form.List name="matchExpression">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map(field => (
                      <Row key={field} gutter={5}>
                        <Col span={7}>
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
                        <Col span={7}>
                          <FormItemLabel name="Operator" />
                          <Form.Item
                            {...field}
                            name={[field.name, 'operator']}
                            fieldKey={[field.fieldKey, 'operator']}
                            rules={[{ required: true, message: "Please enter value!" }]}
                          >
                            <Select placeholder="Operator">
                              <Select.Option value="In">In</Select.Option>
                              <Select.Option value="NotIn">NotIn</Select.Option>
                              <Select.Option value="Exists">Exists</Select.Option>
                              <Select.Option value="DoesNotExist">DoesNotExist</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <FormItemLabel name="Values" />
                          <Form.Item
                            {...field}
                            name={[field.name, 'values']}
                            fieldKey={[field.fieldKey, 'values']}
                            rules={[{ required: true, message: "Please enter value!" }]}
                          >
                            <Select
                              mode="tags"
                              placeholder="Tags"
                            >
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <DeleteOutlined
                            onClick={() => {
                              remove(field.name);
                            }}
                            style={{ marginTop: 47 }}
                          />
                        </Col>
                      </Row>
                    ))}

                    <Form.Item>
                      <Button
                        onClick={() => {
                          form.validateFields([...fields.map(obj => ["matchExpression", obj.name, "key"]), ...fields.map(obj => ["matchExpression", obj.name, "operator"]), ...fields.map(obj => ["matchExpression", obj.name, "value"])])
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

export default AddTaskForm;
