import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { Modal, Form, Input } from 'antd';
import { applyCoupon, notify } from '../../../utils';
import { increment, decrement } from 'automate-redux';
import FormItemLabel from "../../form-item-label/FormItemLabel";

function ApplyCouponModal(props) {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const countryCode = useSelector(state => state.billing.details.country)
  const currencyNotation = countryCode === "IN" ? "₹": "$";
  const handleSubmit = function (event) {
    event.preventDefault()
    form.validateFields().then(values => {
      dispatch(increment("pendingRequests"))
      applyCoupon(values.couponCode)
        .then((couponValue) => {
          notify("success", "Successfully applied coupon code", `Amount worth ${currencyNotation}${couponValue / 100} credited to your account`)
          props.handleCancel()
        })
        .catch((ex) => notify("error", "Error applying coupon code", ex))
        .finally(dispatch(decrement("pendingRequests")))
    })
  }
  return (
    <Modal
      title="Apply coupon"
      okText="Apply"
      visible={true}
      onOk={handleSubmit}
      onCancel={props.handleCancel}
    >
      <Form form={form}>
        <FormItemLabel name="Coupon code" description="Apply a coupon code to get free credits to your account immediately" />
        <Form.Item name="couponCode" rules={[{ required: true, message: 'Please provide a coupon code' }]}>
          <Input placeholder="Coupon code" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ApplyCouponModal