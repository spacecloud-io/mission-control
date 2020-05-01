import React from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import CardSection from './card-section/CardSection';
import { Form, Button, Input, Select, Card } from 'antd';
import client from "../../../client"
import countries from "./countries.json"
import { notify, fetchBillingDetails } from '../../../utils';
import store from '../../../store';
import { increment, decrement } from 'automate-redux';
import { useState } from 'react';
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
        <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: '24px' }}>Save your billing details</Button>
      </Form>
    </div>
  );
}

const WrappedBillingDetailsForm = Form.create({})(BillingDetailsForm);

const AddBillingDetails = ({ stripe, handleSuccess }) => {
  const [invoiceId, setInvoiceId] = useState(undefined)
  const handleStripePayment = (paymentMethodId, address) => {
    const name = localStorage.getItem("name")
    store.dispatch(increment("pendingRequests"))
    client.billing.setBillingDetails(name, address, paymentMethodId, invoiceId)
      .then((subscriptionStarted, requiresAction, invoiceId, subscriptionId, paymentIntentSecret) => {
        if (subscriptionStarted) {
          fetchBillingDetails()
          handleSuccess()
          return
        }
        // Store the invoiceId as it is required while retrying with new card
        setInvoiceId(invoiceId)

        // If the subscription is not started with no further action (3d secure) required
        // we assume that the card was invalid or declined and let user try with another card.
        if (!requiresAction) {
          notify("error", "Error saving billing details", "Card declined. Make sure your card details are proper.")
          return
        }

        // Requires Action Workflow:
        stripe.confirmCardPayment(paymentIntentSecret).then(function (result) {
          if (result.error) {
            // Display error.message in your UI.
            notify("error", "Error in 3d secure payment", result.error.message)
          } else {
            // The payment has succeeded. Inform the enterprise server about it
            store.dispatch(increment("pendingRequests"))
            client.billing.handle3DSecureSuccess(subscriptionId).then(() => {
              fetchBillingDetails()
              handleSuccess()
            })
              .catch(ex => notify("error", "Error notifying Space Up server about billing success", ex))
              .finally(() => store.dispatch(decrement("pendingRequests")))
          }
        });
      })
      .catch(ex => notify("error", "Error saving billing details", ex))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  }
  return (
    <Card style={{ padding: '24px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
      <Elements stripe={stripe}>
        <WrappedBillingDetailsForm handleStripePayment={handleStripePayment} />
      </Elements>
    </Card>
  );
}

export default AddBillingDetails;