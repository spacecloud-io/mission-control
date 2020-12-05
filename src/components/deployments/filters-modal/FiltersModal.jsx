import React from "react";
import { Form, Modal, Radio, Input, Select, InputNumber, Checkbox, DatePicker } from "antd";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import RadioCards from "../../radio-cards/RadioCards";
import ConditionalFormBlock from "../../conditional-form-block/ConditionalFormBlock";
import moment from "moment";

const FiltersModal = ({ initialValues = {}, handleCancel, handleSubmit }) => {

  const [form] = Form.useForm()
  const formInitialValues = Object.assign({}, initialValues, {
    date: initialValues.date ? moment(initialValues.date) : undefined,
    limit: initialValues.limit ? initialValues.limit : 100
  })

  const handleSubmitClick = () => {
    form.validateFields().then(values => {
      if (values.date) {
        values.date = values.date.toISOString()
      }
      handleSubmit(values)
    })
  }

  return (
    <Modal
      title="Filter logs"
      visible={true}
      okText="Save filters"
      onCancel={handleCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" form={form} initialValues={formInitialValues}>
        <FormItemLabel name="Show logs since" />
        <Form.Item name="since">
          <RadioCards>
            <Radio.Button value="duration">Specific duration</Radio.Button>
            <Radio.Button value="time">Specific time</Radio.Button>
            <Radio.Button value="start">Start</Radio.Button>
          </RadioCards>
        </Form.Item>
        <ConditionalFormBlock dependency="since" condition={() => form.getFieldValue("since") === "duration"}>
          <FormItemLabel name="Select duration" />
          <Input.Group compact>
            <Form.Item name="time" rules={[{ required: true, message: 'Please select quantity!' }]}>
              <InputNumber placeholder="Quantity" min={0} />
            </Form.Item>
            <Form.Item style={{ width: 200, marginLeft: 16 }} name="unit" rules={[{ required: true, message: 'Please select unit!' }]}>
              <Select placeholder="Unit of time">
                <Select.Option value="s">second</Select.Option>
                <Select.Option value="m">minute</Select.Option>
                <Select.Option value="h">hour</Select.Option>
              </Select>
            </Form.Item>
          </Input.Group>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="since" condition={() => form.getFieldValue("since") === "time"}>
          <FormItemLabel name="Select time" />
          <Form.Item name="date" rules={[{ type: 'object', required: true, message: 'Please select time!' }]}>
            <DatePicker style={{ width: 360 }} placeholder="Select date and time" showTime />
          </Form.Item>
        </ConditionalFormBlock>
        <FormItemLabel name="Tail logs" />
        <Form.Item name='tail' valuePropName='checked'>
          <Checkbox>Limit the displayed logs to most recent N number of logs</Checkbox>
        </Form.Item>
        <ConditionalFormBlock dependency="tail" condition={() => form.getFieldValue("tail")}>
          <FormItemLabel name="Specify limit" />
          <Form.Item name="limit" rules={[{ required: true, message: 'Please select number of rows!' }]}>
            <InputNumber style={{ width: 240 }} placeholder="Number of log rows" min={0} />
          </Form.Item>
        </ConditionalFormBlock>
      </Form>
    </Modal>
  )
}

export default FiltersModal