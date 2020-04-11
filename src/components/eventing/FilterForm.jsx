import React from "react"
import { Modal, Form, Select, Checkbox, DatePicker, Icon } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
//redux
import { useDispatch, useSelector } from "react-redux";
import { set, reset } from "automate-redux";
import { getProjectConfig } from "../../utils";
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const FilterForm = (props) => {
  const dispatch = useDispatch();
  const eventFilters = useSelector(state => state.uiState.eventFilters);
  const projects = useSelector(state => state.projects);

  const triggerNames = Object.keys(getProjectConfig(projects, props.projectID, "modules.eventing.triggers"));

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, fieldsValue) => {
      let values = {};
      if (!err) {
        if (getFieldValue("showDate")) {
          const rangeValue = fieldsValue["range-picker"];
          values = {
            ...fieldsValue,
            startDate: rangeValue[0].unix(),
            endDate: rangeValue[1].unix()
          }
        }
        else {
          values = { ...fieldsValue }
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
      cancelButtonProps={{ style: { float: "left" }, onClick: () => { dispatch(reset("uiState.eventFilters")); props.handleCancel() } }}
      cancelText="Reset Filters"
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Filter by status" />
        <Form.Item>
          {getFieldDecorator('status', {
            initialValue: eventFilters.status ? eventFilters.status : ['processed', 'failed', 'staged']
          })(
            <Checkbox.Group>
              <Checkbox value="processed">Processed <Icon type="check" style={{ color: "#00FF00" }} /></Checkbox>
              <Checkbox value="failed">Failed <Icon type="close" style={{ color: "red" }} /></Checkbox>
              <Checkbox value="staged">Pending <Icon type="hourglass" /></Checkbox>
            </Checkbox.Group>
          )}
        </Form.Item>
        <FormItemLabel name="Filter by trigger name" />
        <Form.Item>
          {getFieldDecorator('showName', {
            initialValue: eventFilters.showName,
            valuePropName: 'checked'
          })
            (
              <Checkbox>
                Show logs of specific event triggers
            </Checkbox>
            )}
        </Form.Item>
        {getFieldValue('showName') && (
          <>
            <FormItemLabel name="Specify event triggers" />
            <Form.Item>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: "Please select atleast one event trigger" }],
                initialValue: eventFilters.name ? eventFilters.name : undefined
              })
                (
                  <Select mode="multiple" placeholder="Select event triggers for which you want to see the logs">
                    {triggerNames.map(val => <Option key={val}>{val}</Option>)}
                  </Select>
                )}
            </Form.Item>
          </>
        )}
        <FormItemLabel name="Filter by date" />
        <Form.Item>
          {getFieldDecorator('showDate', {
            initialValue: eventFilters.showDate,
            valuePropName: 'checked'
          })
            (
              <Checkbox>
                Show logs between a specific period
            </Checkbox>
            )}
        </Form.Item>
        {getFieldValue('showDate') && (
          <>
            <FormItemLabel name="Specify period" />
            <Form.Item>
              {getFieldDecorator("range-picker", {
                rules: [{ type: "array", required: true, message: "Please enter the duration!" }],
                initialValue: eventFilters.startDate ? [moment.unix(eventFilters.startDate, 'YYYY-MM-DD'), moment.unix(eventFilters.endDate, 'YYYY-MM-DD')] : [moment().subtract(7, 'd'), moment()]
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

