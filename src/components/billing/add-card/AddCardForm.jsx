import React from 'react';
import { useStripe, useElements, Elements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button, Form, Input } from 'antd';
import creditCardSvg from '../../../assets/credit-card.svg';
import './add-card-form.css';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const StripForm = ({ handleSubmit }) => {

  const stripe = useStripe();
  const elements = useElements();
  const [form] = Form.useForm();

  const cardNumberOptions = {
    showIcon: true,
    placeholder: 'Card Number',
    classNames: 'card-input'
  };

  const cardExpiryOptions = {
    placeholder: 'Expiry Date (mm/yyyy)',
    classNames: 'card-input'
  };

  const cardCvcOptions = {
    placeholder: 'CVC',
    classNames: 'card-input'
  };

  const handleSubmitClick = () => {

    if (!stripe || !elements) {
      return;
    }
    form.validateFields().then(values => {
      handleSubmit(stripe, elements.getElement(CardNumberElement))
    })
  };

  return(
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <img src={creditCardSvg} style={{ width: '32px', height: '32px' }} />
        <span style={{ fontSize: '16px', marginLeft: '16px' }}>Enter your credit card details</span>
      </div>
      <Form form={form} onFinish={handleSubmitClick}>
        <Form.Item name='name' rules={[{ required: true, message: 'Please enter Cardholder’s Name!' }]}>
          <Input placeholder='Cardholder’s Name' />
        </Form.Item>
        <Form.Item name='number' rules={[{ required: true, message: 'Please enter Card Number!' }]} className='card-input' >
          <CardNumberElement options={cardNumberOptions} />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Form.Item name='expiry' rules={[{ required: true, message: 'Please enter Card’s Expiry Date!' }]} style={{ width: '45%' }}>
            <CardExpiryElement options={cardExpiryOptions} />
          </Form.Item>
          <Form.Item name='cvc' rules={[{ required: true, message: 'Please enter Card’s CVC!' }]} style={{ width: '45%', marginLeft: '10%' }}>
            <CardCvcElement options={cardCvcOptions} />  
          </Form.Item>
        </div>
        <Button type='primary' block size="large" onClick={handleSubmitClick} style={{ marginTop: 24 }}>Add Card</Button>
      </Form>
    </React.Fragment>
  );
}

export default function AddCardForm({ handleSubmit }) {

  return(
    <React.Fragment>
      <Elements stripe={stripePromise}>
        <StripForm handleSubmit={handleSubmit} />
      </Elements>
    </React.Fragment>
  );
};