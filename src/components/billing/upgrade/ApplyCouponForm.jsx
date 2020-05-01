import React from 'react';
import { useDispatch } from "react-redux";
import { Row, Col, Form, Input, Button } from 'antd';
import { applyCoupon, notify } from '../../../utils';
import { increment, decrement } from 'automate-redux';

function ApplyCouponForm(props) {
  const dispatch = useDispatch()
  const { getFieldDecorator } = props.form;
  const handleSubmit = (event) => {
    event.preventDefault()
    props.form.validateFields((err, values) => {
      if (!err) {
        dispatch(increment("pendingRequests"))
        applyCoupon(values.couponCode)
          .then((couponValue) => notify("success", "Successfully applied coupon code", `Credits worth $${couponValue} credited to your account`))
          .catch((ex) => notify("error", "Error applying coupon code", ex))
          .finally(dispatch(decrement("pendingRequests")))
      }
    })
  }
  return (
    <Form onSubmit={handleSubmit}>
      <p style={{ marginBottom: 0, marginTop: '32px' }}><b>Coupon code</b> (Optional)</p>
      <p style={{ marginTop: 0, fontSize: '14px', fontWeight: 300 }}>Apply a coupon code to get free credits to your  account</p>
      <Row>
        <Col xs={{ span: 18 }}>
          <Form.Item>
            {getFieldDecorator('couponCode', {
              rules: [{ required: true, message: 'Please input coupon code' }],
            })(
              <Input placeholder="Coupon code" />
            )}
          </Form.Item>
        </Col>
        <Col xs={{ span: 5, offset: 1 }}>
          <Button htmlType="submit">Apply</Button>
        </Col>
      </Row>
    </Form>
  )
}
export default Form.create({})(ApplyCouponForm)
