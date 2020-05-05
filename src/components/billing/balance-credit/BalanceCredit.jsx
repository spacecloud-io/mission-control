import React, { useState } from 'react';
import { Card, Button } from 'antd';
import ApplyCouponModal from './ApplyCouponModal';

export default function BalanceCredit({ currencyNotation, balanceCredits = 0 }) {
  const [couponModalVisible, setCouponModalVisible] = useState(false)

  return (
    <div>
      <Card style={{ textAlign: 'center', height: '360px' }}>
        <h1>Balance Credits</h1>
        <p style={{ marginTop: "35px", marginBottom: '32px', fontSize: "28px", color: "#34A853" }}>{currencyNotation}{(balanceCredits * -1) / 100}</p>
        <p><b>Want some free credits? 😛</b></p>
        <p>Apply a coupon code and get free credits to your account instantly! </p>
        <Button type="primary" style={{ marginTop: '24px', width: '50%' }} onClick={() => setCouponModalVisible(true)}>Apply coupon code</Button>
      </Card>
      {couponModalVisible && <ApplyCouponModal handleCancel={() => setCouponModalVisible(false)} />}
    </div>
  );
}