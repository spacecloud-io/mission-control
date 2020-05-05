import React from 'react';
import { useDispatch } from "react-redux";
import { Modal, Form, Input } from 'antd';
import { applyCoupon, notify } from '../../../utils';
import { increment, decrement } from 'automate-redux';

function ApplyCouponModal(props) {
  const dispatch = useDispatch()
  const { getFieldDecorator } = props.form;
  const handleSubmit = function(event) {
    event.preventDefault()
    props.form.validateFields((err, values) => {
      if (!err) {
        dispatch(increment("pendingRequests"))
        applyCoupon(values.couponCode)
          .then((couponValue) => {
            notify("success", "Successfully applied coupon code", `Credits worth $${couponValue/100} credited to your account`)
            props.handleCancel()
          })
          .catch((ex) => notify("error", "Error applying coupon code", ex))
          .finally(dispatch(decrement("pendingRequests")))
      }
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
      <Form>
        <p style={{ marginBottom: 0 }}><b>Coupon code</b></p>
        <p style={{ marginTop: 0, fontSize: '14px', fontWeight: 300 }}>Apply a coupon code to get free credits to your account immediately</p>
        <Form.Item>
          {getFieldDecorator('couponCode', {
            rules: [{ required: true, message: 'Please provide a coupon code' }],
          })(
            <Input className="input" placeholder="Coupon code" />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}

const WrappedApplyCouponModal = Form.create({})(ApplyCouponModal);
export default WrappedApplyCouponModal