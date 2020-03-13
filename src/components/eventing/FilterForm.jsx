import React, {useEffect, useState} from "react"
import { Modal, Form, Select, Checkbox, DatePicker, Icon} from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
import client from "../../client";
//redux
import {useDispatch, useSelector} from "react-redux";
import {set, increment, decrement} from "automate-redux";

import moment from 'moment';

const {Option} = Select;
const { RangePicker } = DatePicker;

const FilterForm = (props) => {
  const dispatch = useDispatch();
  const eventFilters = useSelector(state => state.uiState.eventFilters);
  const triggerNames = useSelector(state => state.uiState.triggerNames);
  
  useEffect(() => {
    dispatch(increment("pendingRequests")); 
    client.eventing.fetchTriggerNames(props.projectID)
    .then(res => dispatch(set("uiState.triggerNames", res.map(val => val.rule_name))))
    .catch(ex => console.log(ex))
    .finally(() => dispatch(decrement("pendingRequests")))
  }, [])

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, fieldsValue) => {
      let values = {};
      if (!err) {
        if(getFieldValue("showDate")){
          const rangeValue = fieldsValue["range-picker"];
          values = {
            ...fieldsValue,
            startDate: rangeValue[0].unix(),
            endDate: rangeValue[1].unix()
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
  const { getFieldDecorator, getFieldValue, resetFields } = props.form;

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
            initialValue: eventFilters.status ? eventFilters.status : ['processed', 'failed', 'staged']
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
          {getFieldDecorator('showName', {
            initialValue: eventFilters.showName ? true : false
          })
          (
            <Checkbox>Show logs of specific event triggers</Checkbox>
          )}
        </Form.Item>
        {getFieldValue('showName') && (
          <>
          <FormItemLabel name="Specify event triggers" />
          <Form.Item>
            {getFieldDecorator('name', {
              rules: [{required: true, message: "Please select an event trigger"}],
              initialValue: eventFilters.name ? eventFilters.name : undefined
            })
            (
              <Select placeholder="Select event triggers for which you want to see the logs">
                {triggerNames.map(val => <Option key={val}>{val}</Option>)}
              </Select>
            )}
          </Form.Item>
          </>
        )}
        <FormItemLabel name="Filter by date" />
        <Form.Item>
          {getFieldDecorator('showDate', {
            initialValue: eventFilters.showDate ? true : false
          })
          (
            <Checkbox>Show logs between a specific period</Checkbox>
          )}
        </Form.Item>
        {getFieldValue('showDate') && (
          <>
          <FormItemLabel name="Specify period" />
          <Form.Item>
            {getFieldDecorator("range-picker", {
              rules: [{ type: "array", required: true, message: "Please enter the duration!" }],
              initialValue: eventFilters.showDate ? [moment.unix(eventFilters.startDate, 'YYYY-MM-DD'), moment.unix(eventFilters.endDate, 'YYYY-MM-DD')] : undefined
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

