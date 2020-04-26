import React from 'react';
import { Row, Col, Card, Form } from 'antd';
import CheckoutForm from '../chekout-form/CheckoutForm';
import {Elements} from '@stripe/react-stripe-js';

const AddBillingDetail = (props) => {
    return(
        <Row>
            <Col lg={{ span: 8, offset:8 }}>
                <Card style={{ padding:'48px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
                    <Elements stripe={props.stripePromise}>
                        <CheckoutForm handleStripePayment={props.handleStripePaymentMethod} />
                    </Elements>
                </Card>
            </Col>
        </Row>
    );
}

export default AddBillingDetail;