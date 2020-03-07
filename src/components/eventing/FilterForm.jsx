import React from "react"
import { Modal, Form, Select, Checkbox, DatePicker, Icon} from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const {Option} = Select;
const { RangePicker } = DatePicker;

const FilterForm = (props) => {
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, fieldsValue) => {
      let values = {};
      if (!err) {
        if(getFieldValue("show-date")){
          const rangeValue = fieldsValue["range-picker"];
          values = {
            ...fieldsValue,
            start_date: rangeValue[0].utcOffset(0).set({hour:0,minute:0,second:0,millisecond:0}).toISOString(),
            end_date: rangeValue[1].utcOffset(0).set({hour:23,minute:59,second:59,millisecond:99}).toISOString()
          }
        }
        else {
          values = {...fieldsValue}
        }
        props.filterTable(values);
        props.handleCancel();
      }
    });
  }
  const { getFieldDecorator, getFieldValue } = props.form;

  return (
    <Modal
      title="Filter event logs"
      okText="Apply"
      visible={props.visible}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      cancelButtonProps={{style: {float: "left"}, onClick: () => console.log('here')}}
      cancelText="Reset Filters"
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Filter by status" />
        <Form.Item>
          {getFieldDecorator('status', {
            initialValue: ['processed', 'failed', 'staged']
          })(
            <Checkbox.Group>
              <Checkbox value="processed">Processed <Icon type="check" style={{color: "#00FF00"}}/></Checkbox>
              <Checkbox value="failed">Failed <Icon type="close" style={{color: "red"}}/></Checkbox>
              <Checkbox value="staged">Pending <Icon type="hourglass" /></Checkbox>
            </Checkbox.Group>
          )}
        </Form.Item>
        <FormItemLabel name="Filter by trigger name" />
        <Form.Item>
          {getFieldDecorator('show-name', {})
          (
            <Checkbox>Show logs of specific event triggers</Checkbox>
          )}
        </Form.Item>
        {getFieldValue('show-name') && (
          <>
          <FormItemLabel name="Specify event triggers" />
          <Form.Item>
            {getFieldDecorator('name', {
              rules: [{required: true, message: "Please select an event trigger"}]
            })
            (
              <Select placeholder="Select event triggers for which you want to see the logs">
                {props.triggerNames.map(val => <Option key={val}>{val}</Option>)}
              </Select>
            )}
          </Form.Item>
          </>
        )}
        <FormItemLabel name="Filter by date" />
        <Form.Item>
          {getFieldDecorator('show-date', {})
          (
            <Checkbox>Show logs between a specific period</Checkbox>
          )}
        </Form.Item>
        {getFieldValue('show-date') && (
          <>
          <FormItemLabel name="Specify period" />
          <Form.Item>
            {getFieldDecorator("range-picker", {
              rules: [{ type: "array", required: true, message: "Please enter the duration!" }]
            })(<RangePicker />)}
          </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}

const WrappedFilterForm = Form.create({})(FilterForm);

export default WrappedFilterForm

