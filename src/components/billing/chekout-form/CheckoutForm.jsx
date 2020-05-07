import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import CardSection from '../card-section/CardSection';
import { Button, Modal, Form } from 'antd';

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [form] = Form.useForm();

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
    <Modal
      title="Add subscription"
      okText="Subscribe"
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form form={form} onFinish={handleSubmit}>
        <CardSection />
      </Form>
    </Modal>
  );
}

export default CheckoutForm;