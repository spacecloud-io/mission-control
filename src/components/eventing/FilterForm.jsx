import React, {useState} from "react"
import { CheckOutlined, CloseOutlined, HourglassOutlined } from '@ant-design/icons';
import { Modal, Select, Checkbox, DatePicker, Form } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
//redux
import { useDispatch, useSelector } from "react-redux";
import { set, reset } from "automate-redux";
import { getProjectConfig } from "../../utils";
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const FilterForm = (props) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const eventFilters = useSelector(state => state.uiState.eventFilters);
  const projects = useSelector(state => state.projects);
  const [showDate, setShowDate] = useState();

  const triggerNames = Object.keys(getProjectConfig(projects, props.projectID, "modules.eventing.triggers"));

  const handleChangedValues = ({ showDate }) => {
    setShowDate(showDate);
  }

  const handleSubmit = e => {
    form.validateFields().then(fieldsValue => {
      // console.log(fieldsValue);
      let values = {};
      if (showDate) {
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
    });
  }

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
      <Form layout="vertical" form={form} onValuesChange={handleChangedValues} onFinish={handleSubmit} 
      initialValues={{ 'status': eventFilters.status ? eventFilters.status : ['processed', 'failed', 'staged'],
       'name': eventFilters.name ? eventFilters.name : undefined, 'showDate': eventFilters.showDate,
       'range-picker': eventFilters.startDate ? [moment.unix(eventFilters.startDate, 'YYYY-MM-DD'), moment.unix(eventFilters.endDate, 'YYYY-MM-DD')] : [moment().subtract(7, 'd'), moment()] }}>
        <FormItemLabel name="Filter by status" />
        <Form.Item name="status">
            <Checkbox.Group>
              <Checkbox value="processed">Processed <CheckOutlined style={{ color: "#00FF00" }} /></Checkbox>
              <Checkbox value="failed">Failed <CloseOutlined style={{ color: "red" }} /></Checkbox>
              <Checkbox value="staged">Pending <HourglassOutlined /></Checkbox>
            </Checkbox.Group>
        </Form.Item>
        <FormItemLabel name="Filter by trigger name" />
        <Form.Item name="showName" valuePropName="checked">
              <Checkbox>
                Show logs of specific event triggers
            </Checkbox>
        </Form.Item>
        {form.getFieldValue('showName') && (
          <>
            <FormItemLabel name="Specify event triggers" />
            <Form.Item name="name" rules={[{ required: true, message: "Please select atleast one event trigger" }]}>
                  <Select mode="multiple" placeholder="Select event triggers for which you want to see the logs">
                    {triggerNames.map(val => <Option key={val}>{val}</Option>)}
                  </Select>
            </Form.Item>
          </>
        )}
        <FormItemLabel name="Filter by date" />
        <Form.Item name="showDate" valuePropName="checked">
              <Checkbox>
                Show logs between a specific period
            </Checkbox>
        </Form.Item>
        {form.getFieldValue('showDate') && (
          <>
            <FormItemLabel name="Specify period" />
            <Form.Item name="range-picker" rules={[{ type: "array", required: true, message: "Please enter the duration!" }]}>
              (<RangePicker />)}
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}

export default FilterForm

