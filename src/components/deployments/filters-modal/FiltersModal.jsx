import React from "react";
import { Form, Modal, Radio, Input, Select, InputNumber, Checkbox, DatePicker } from "antd";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import RadioCards from "../../radio-cards/RadioCards";
import ConditionalFormBlock from "../../conditional-form-block/ConditionalFormBlock";
import { useSelector } from "react-redux";
import moment from "moment";

const FiltersModal = (props) => {

  const [form] = Form.useForm()
  const initialFilters = useSelector(state => state.uiState.deploymentLogsFilters)

  const initialValues = Object.keys(initialFilters).length > 0 ? 
  {
    ...initialFilters,
    date: initialFilters.date ? moment(initialFilters.date) : undefined
  }
  : {
    since: "duration",
    time: 1,
    unit: "h",
    tail: false,
    limit: 100
  }

  const handleSubmitClick = () => {
    form.validateFields().then(values => {
      if (values.date) {
        values.date = values.date.format('YYYY-MM-DD HH:mm:ss')
      }
      props.filterLogs(values)
    })
  }

  return (
    <Modal
      title="Filters log"
      visible={true}
      okText="Add"
      onCancel={props.onCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" form={form} initialValues={initialValues}>
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
            <Form.Item name="time" style={{ width: 120 }}>
              <InputNumber />
            </Form.Item>
            <Form.Item name="unit" style={{ width: 120 }}>
              <Select>
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
          <Form.Item name="limit">
            <InputNumber />
          </Form.Item>
        </ConditionalFormBlock>
      </Form>
    </Modal>
  )
}

export default FiltersModal