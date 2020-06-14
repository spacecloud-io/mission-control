import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';
import './select-plan.css';

function FlexContainer({ children }) {
  return (
    <div style={{ display: "flex", height: 300, flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
      {children}
    </div>
  )
}

export default function SelectPlan({ selectedPlan, handleSelectPlan, handleContactUs }) {
  const isPlanEnterprise = !selectedPlan.startsWith("space-cloud-pro") && !selectedPlan.startsWith("space-cloud-open")

  return (
    <Row className="select-plan">
      <Col lg={{ span: 7, offset: 0 }}>
        <Card className="select-plan-card green-card">
          <FlexContainer>
            <div>
              <h3 className="select-plan-plan green">OPENSOURCE</h3>
              <h1 className="select-plan-amount green">$0</h1>
              <p className="select-plan-time green">per month</p>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>1 project</Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>1 database</Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>Community support</Typography.Paragraph>
            </div>
            {selectedPlan.startsWith("space-cloud-open") && <Button size="large" className="select-plan-button selected-button">Current plan</Button>}
            {!selectedPlan.startsWith("space-cloud-open") && <Button size="large" className="select-plan-button green-button" onClick={() => handleSelectPlan("space-cloud-open--monthly")}>Use this plan</Button>}
          </FlexContainer>
        </Card>
      </Col>
      <Col lg={{ span: 7, offset: 1 }}>
        <Card className="select-plan-card blue-card">
          <FlexContainer>
            <div>
              <h3 className="select-plan-plan blue">PRO</h3>
              <h1 className="select-plan-amount blue">$90</h1>
              <p className="select-plan-time blue">per month</p>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>1 project</Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>3 databases</Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>Email support (48 hrs response time)</Typography.Paragraph>
            </div>
            {selectedPlan.startsWith("space-cloud-pro") && <Button size="large" className="select-plan-button selected-button">Current plan</Button>}
            {!selectedPlan.startsWith("space-cloud-pro") && <Button size="large" className="select-plan-button blue-button" onClick={() => handleSelectPlan("space-cloud-pro--monthly")}>Use this plan</Button>}
          </FlexContainer>
        </Card>
      </Col>
      <Col lg={{ span: 7, offset: 1 }}>
        <Card className="select-plan-card purple-card">
          <FlexContainer>
            <div>
              <h3 className="select-plan-plan purple">ENTERPRISE</h3>
              <h1 className="select-plan-amount purple" style={{ marginBottom: 24 }}>👑</h1>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>5 clusters</Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>Unlimited projects</Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>Unlimited databases</Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis>Email support (48 hrs response time)</Typography.Paragraph>
            </div>
            {isPlanEnterprise && <Button size="large" className="select-plan-button selected-button">Current plan</Button>}
            {!isPlanEnterprise && <Button size="large" className="select-plan-button purple-button" onClick={() => handleContactUs("Purchase Space Cloud Enterprise license")}>Contact us</Button>}
          </FlexContainer>
        </Card>
      </Col>
      <Col lg={{ span: 23 }}>
        <Card className="select-plan-card" style={{ marginTop: "32px" }}>
          <span style={{ fontSize: "14px", marginRight: "24px" }}>Want a customized plan to suit your needs? Don’t worry we have got you covered!</span>
          <Button type="primary" ghost style={{ width: "188px" }} onClick={() => handleContactUs()}>Contact us</Button>
        </Card>
      </Col>
    </Row>
  );
}