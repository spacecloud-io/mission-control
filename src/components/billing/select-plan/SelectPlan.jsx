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
          {selectedPlan === "open" && <Button className="select-plan-button selected-button">Current plan</Button>}
          {selectedPlan !== "open" && <Button className="select-plan-button green-button" onClick={() => handleSelectPlan("open")}>Use this plan</Button>}
        </Card>
      </Col>
      <Col lg={{ span: 7, offset: 1 }}>
        <Card className="select-plan-card blue-card">
          <h3 className="select-plan-plan blue">PRO</h3>
          <h1 className="select-plan-amount blue">$25</h1>
          <p className="select-plan-time blue">per month</p>
          <span>1 Project</span><br />
          <span>3 Databases</span><br />
          <span>2 day priority email support</span><br />
          {selectedPlan === "pro" && <Button className="select-plan-button selected-button">Current plan</Button>}
          {selectedPlan !== "pro" && <Button className="select-plan-button blue-button" onClick={() => handleSelectPlan("pro")}>Use this plan</Button>}
        </Card>
      </Col>
      <Col lg={{ span: 7, offset: 1 }}>
        <Card className="select-plan-card purple-card">
          <h3 className="select-plan-plan purple">TEAMS</h3>
          <h1 className="select-plan-amount purple">$99</h1>
          <p className="select-plan-time purple">per month</p>
          <span>2 Projects</span><br />
          <span>3 Databases/project</span><br />
          <span>2 day priority email support</span><br />
          {selectedPlan === "team" && <Button className="select-plan-button selected-button">Current plan</Button>}
          {selectedPlan !== "team" && <Button className="select-plan-button purple-button" onClick={() => handleSelectPlan("team")}>Use this plan</Button>}
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