import React from 'react';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import CardSection from '../card-section/CardSection';
import { Form, Button, Input, Select } from 'antd';
const { Option } = Select;

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const { getFieldDecorator } = props.form;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: {
        email: localStorage.getItem('email'),
      },
    });
    props.handleStripePayment(result.paymentMethod.id);
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <p><b>Add your card</b></p>
        <Form.Item>
          {getFieldDecorator('card-details', {
              rules: [{ required: true, message: 'Please provide a card details' }],
          })(
              <CardSection />
          )}
        </Form.Item>
        <p style={{ marginTop:'48px' }}><b>Billing address</b></p>
        <Form.Item>
          {getFieldDecorator('country', {
              rules: [{ required: true, message: 'Please select your country' }],
          })(
              <Select placeholder="Select your country">
                <Select.Option key="1" value="usa">USA</Select.Option>
                <Select.Option key="2" value="uk">UK</Select.Option>
                <Select.Option key="3" value="india">India</Select.Option>
              </Select>
          )}
        </Form.Item>
        <Form.Item style={{ marginTop:'-8px'}}>
          {getFieldDecorator('street', {
              rules: [{ required: false}],
          })(
              <Input placeholder="Street" />
          )}
        </Form.Item>
        <Button type="primary" style={{ width:'100%', marginTop:'24px' }}>Save your Billing details</Button>
      </Form>
    </div>
  );
}

const WrappedCheckoutForm = Form.create({})(CheckoutForm);

export default WrappedCheckoutForm;