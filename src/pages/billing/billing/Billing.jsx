import React, { useState } from 'react';
import { Col, Row } from 'antd';
import Topbar from '../../../components/topbar/Topbar';
import PaymentDetails from '../../../components/billing/billing-accounts/PaymentDetails';
import BillingResource from '../../../components/billing/billing-accounts/BillingResource';
import CurrentEstimation from '../../../components/billing/billing-accounts/CurrentEstimation';
import Invoices from '../../../components/billing/billing-accounts/Invoices';
import './billing.css';

const Billing = () => {

  return(
    <React.Fragment>
      <Topbar />
      <div className='billing-content'>
        <Row style={{ padding: '32px' }}>
          <Col xs={{ span: 22, offset: 1 }} lg={{ span: 18, offset: 3 }}>
            <Row gutter={[16, 32]}>
              <Col xs={{ span: 24, offset: 0 }} lg={{ span: 12, offset: 0 }}>
                <PaymentDetails />
              </Col>
              <Col xs={{ span: 24, offset: 0 }} lg={{ span: 12, offset: 0 }}>
                <BillingResource />
              </Col>
              <Col xs={{ span: 24, offset: 0 }} lg={{ span: 24, offset: 0 }}>
                <CurrentEstimation />
              </Col>
              <Col xs={{ span: 24, offset: 0 }} lg={{ span: 24, offset: 0 }}>
                <Invoices />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
}

export default Billing;