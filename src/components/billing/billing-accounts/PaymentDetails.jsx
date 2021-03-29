import React from 'react';
import { Card } from 'antd';
import mastercardSvg from '../../../assets/mastercard.svg';

const PaymentDetails = () => {
  return(
    <Card bordered style={{ background: '#F8FAFC' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>Payment details</h3>
        <a>Change credit card</a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
        <img src={mastercardSvg} />
        <p style={{ marginLeft: '16px', alignSelf: 'center' }}>**** **** **** 3376</p>
      </div>
      <div style={{ marginLeft: '58px' }}>
        <p>MasterCard - Expires 05/22</p>
        <p style={{ marginTop: '40px', marginBottom: 0 }}>Billed on every 5th of the month.</p>
        <p style={{ marginTop: 0 }}>Next billing : 5th March 2021</p>
      </div>
    </Card>
  );
}

export default PaymentDetails;