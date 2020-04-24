import React from 'react';
import { Card, Button, Icon, Row, Col } from 'antd';

const BillingDetails = () => {
    return (
        <Card>
            <h1>Billing details</h1>
            <Row>
                <Col xs={{ span: 12 }}>
                    <p style={{ marginTop: '6%' }}><b>Name</b></p>
                    <p style={{ marginBottom: '12%' }}>Jayesh Choudary</p>
                </Col>
                <Col xs={{ span: 12 }}>
                    <p style={{ marginTop: '6%' }}><b>Email</b></p>
                    <p style={{ marginBottom: '12%' }}>jayesh@spaceuptech.com</p>
                </Col>
                <Col xs={{ span: 12 }}>
                    <p><b>Country</b></p>
                    <p style={{ marginBottom: '12%' }}>India</p>
                </Col>
                <Col xs={{ span: 24 }}>
                    <p><b>Card details</b></p>
                    <p>Visa card ending in 4172. valid till 08/25</p>
                </Col>
            </Row>
        </Card>
    );
}

export default BillingDetails;