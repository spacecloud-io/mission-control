import React from 'react';
import { Card, Row, Col } from 'antd';

const BillingDetails = () => {
    return (
        <Card>
            <h1>Billing details</h1>
            <Row>
                <Col xs={{ span: 12 }}>
                    <p style={{ marginTop: '24px' }}><b>Name</b></p>
                    <p style={{ marginBottom: '24px' }}>Jayesh Choudary</p>
                </Col>
                <Col xs={{ span: 12 }}>
                    <p style={{ marginTop: '24px' }}><b>Email</b></p>
                    <p style={{ marginBottom: '24px' }}>jayesh@spaceuptech.com</p>
                </Col>
                <Col xs={{ span: 12 }}>
                    <p><b>Country</b></p>
                    <p style={{ marginBottom: '24px' }}>India</p>
                </Col>
                <Col xs={{ span: 12 }}>
                    <p><b>Card details</b></p>
                    <p style={{ marginBottom: '24px' }}>Visa card ending in 4172. valid till 08/25</p>
                </Col>
                <Col xs={{ span: 24 }}>
                    <p><b>Balance credits</b></p>
                    <p style={{ fontSize:'24px', color:'#34A853' }}>$15</p>
                </Col>
            </Row>
        </Card>
    );
}

export default BillingDetails;