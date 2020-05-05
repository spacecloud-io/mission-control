import React from 'react';
import { Card, Row, Col } from 'antd';
import { capitalizeFirstCharacter } from '../../../utils';

const BillingDetails = ({ billingDetails, name, email }) => {
  return (
    <Card>
      <h1 style={{ textAlign: 'center' }}>Billing details</h1>
      <Row>
        <Col xs={{ span: 12 }}>
          <p style={{ marginTop: '24px' }}><b>Name</b></p>
          <p style={{ marginBottom: '24px' }}>{name}</p>
        </Col>
        <Col xs={{ span: 12 }}>
          <p style={{ marginTop: '24px' }}><b>Email</b></p>
          <p style={{ marginBottom: '24px' }}>{email}</p>
        </Col>
        <Col xs={{ span: 12 }}>
          <p><b>Country</b></p>
          <p style={{ marginBottom: '24px' }}>{billingDetails.country}</p>
        </Col>
        <Col xs={{ span: 24 }}>
          <p><b>Card details</b></p>
          <p>{capitalizeFirstCharacter(billingDetails.cardType)} card ending in {billingDetails.cardNumber}. Valid till {billingDetails.cardExpiryDate}</p>
        </Col>
      </Row>
    </Card>
  );
}

export default BillingDetails;