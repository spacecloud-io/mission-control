import React from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import CardSection from './card-section/CardSection';
import { Form, Button, Input, Select, Card } from 'antd';
import countries from "./countries.json"
const countriesOptions = countries.map(obj => <Select.Option key={obj.code} value={obj.code}>{obj.name}</Select.Option>)

const BillingDetailsForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const { getFieldDecorator } = props.form;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    props.form.validateFields(async (err, values) => {
      if (!err) {
        const { cardDetails, ...address } = values
        const result = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
          billing_details: {
            email: localStorage.getItem("email"),
            name: localStorage.getItem("name"),
            address: address
          }
        });
        if (!result.error) {
          props.handleStripePayment(result.paymentMethod.id, address);
        }
      }
    })
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <p><b>Add your card</b></p>
        <Form.Item>
          {getFieldDecorator('cardDetails')(
            <CardSection />
          )}
        </Form.Item>
        <p style={{ marginTop: '48px' }}><b>Billing address</b></p>
        <Form.Item>
          {getFieldDecorator('country', {
            rules: [{ required: true, message: 'Please select your country' }],
          })(
            <Select placeholder="Select your country"
              showSearch
              optionFilterProp="children"
            >
              {countriesOptions}
            </Select>
          )}
        </Form.Item>
        <Form.Item style={{ marginTop: '-8px' }}>
          {getFieldDecorator('line1', {
            rules: [{ required: false }],
          })(
            <Input placeholder="Street" />
          )}
        </Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: '24px' }}>Save your Billing details</Button>
      </Form>
    </div>
  );
}

const WrappedBillingDetailsForm = Form.create({})(BillingDetailsForm);

const AddBillingDetail = (props) => {
  const handleStripePayment = (paymentMethod, address) => {
    
  }
  return (
    <Card style={{ padding: '24px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
      <Elements stripe={props.stripePromise}>
        <WrappedBillingDetailsForm handleStripePayment={handleStripePayment} />
      </Elements>
    </Card>
  );
}

export default AddBillingDetail;