import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import './select-plan.css';

export default function SelectPlan({ selectedPlan, handleSelectPlan, handleContactUs }) {
  return (
    <Row className="select-plan">
      <Col lg={{ span: 7, offset: 0 }}>
        <Card className="select-plan-card green-card">
          <h3 className="select-plan-plan green">OPENSOURCE</h3>
          <h1 className="select-plan-amount green">$0</h1>
          <p className="select-plan-time green">per month</p>
          <span>1 Project</span><br />
          <span>1 Database</span><br />
          <span>Community support</span><br />
          {selectedPlan === "space-cloud-open--monthly" && <Button className="select-plan-button selected-button">Current plan</Button>}
          {selectedPlan !== "space-cloud-open--monthly" && <Button className="select-plan-button green-button" onClick={() => handleSelectPlan("space-cloud-open--monthly")}>Use this plan</Button>}
        </Card>
      </Col>
      <Col lg={{ span: 7, offset: 1 }}>
        <Card className="select-plan-card blue-card">
          <h3 className="select-plan-plan blue">Starter</h3>
          <h1 className="select-plan-amount blue">$25</h1>
          <p className="select-plan-time blue">per month</p>
          <span>1 Project</span><br />
          <span>3 Databases</span><br />
          <span>2 day priority email support</span><br />
          {selectedPlan === "space-cloud-starter--monthly" && <Button className="select-plan-button selected-button">Current plan</Button>}
          {selectedPlan !== "space-cloud-starter--monthly" && <Button className="select-plan-button blue-button" onClick={() => handleSelectPlan("space-cloud-starter--monthly")}>Use this plan</Button>}
        </Card>
      </Col>
      <Col lg={{ span: 7, offset: 1 }}>
        <Card className="select-plan-card purple-card">
          <h3 className="select-plan-plan purple">PRO</h3>
          <h1 className="select-plan-amount purple">$100</h1>
          <p className="select-plan-time purple">per month</p>
          <span>2 Projects</span><br />
          <span>3 Databases/project</span><br />
          <span>2 day priority email support</span><br />
          {selectedPlan === "space-cloud-pro--monthly" && <Button className="select-plan-button selected-button">Current plan</Button>}
          {selectedPlan !== "space-cloud-pro--monthly" && <Button className="select-plan-button purple-button" onClick={() => handleSelectPlan("space-cloud-pro--monthly")}>Use this plan</Button>}
        </Card>
      </Col>
      <Col lg={{ span: 23 }}>
        <Card className="select-plan-card" style={{ marginTop: "32px" }}>
          <span style={{ fontSize: "14px", marginRight: "24px" }}>Want a customized plan to suit your needs? Don’t worry we have got you covered!</span>
          <Button type="primary" ghost style={{ width: "188px" }} onClick={handleContactUs}>Contact us</Button>
        </Card>
      </Col>
    </Row>
  );
}