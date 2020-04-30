import React from 'react';
import { Card, Button } from 'antd';

const BalanceCredit = () => {
    return (
        <Card style={{ textAlign:'center', height:'360px' }}>
            <h1>Balance Credits</h1>
            <p style={{ marginTop:"35px",marginBottom:'32px', fontSize:"28px", color:"#34A853" }}>$25</p>
            <p><b>Want some free credits? 😛</b></p>
            <p>Apply a coupon code and get free credits to your account instantly! </p>
            <Button type="primary" style={{ marginTop:'24px', width:'50%' }}>Apply coupon code</Button>
        </Card>
    );
}

export default BalanceCredit;