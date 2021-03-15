import React from 'react';
import { Row, Col, Card } from 'antd';
import VerifyForm from '../../../components/authentication/verify/VerifyForm';

const Verify = () => {
  
  return(
    <Row className="dark-background">
      <Col xs={{ span: 22, offset: 1 }} lg={{ span: 14, offset: 5 }}>
        <Card className="card-content">
          <VerifyForm />
        </Card>
      </Col>
    </Row>
  );
}

export default Verify;