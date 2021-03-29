import React from 'react';
import { Card, Col, Row } from 'antd'

const BillingResource = () => {
  return(
    <Card bordered style={{ background: '#F8FAFC', height: '100%' }}>
      <h3>Billable resources across all projects</h3>
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col xs={{ span: 12, offset: 0 }}>
          <p>Database : 0</p>
        </Col>
        <Col xs={{ span: 12, offset: 0 }}>
          <p>RAM : 0 GB</p>
        </Col>
        <Col xs={{ span: 12, offset: 0 }}>
          <p>Backup space : 0 GB</p>
        </Col>
        <Col xs={{ span: 12, offset: 0 }}>
          <p>Server space : 0 GB</p>
        </Col>
      </Row>
    </Card>
  );
}

export default BillingResource;