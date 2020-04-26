import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import './select-plan.css';

const SelectPlan = (props) => {

    return (
        <Row className="select-plan">
            <h3 style={{ marginBottom:"0", fontSize:"21px"}}>Upgrade cluster</h3>
            <p style={{ marginBottom:"24px"}}>This Space Cloud cluster is operating in opensource mode right now. Upgrade the cluster to a paid plan to get increased limits for the cluster</p>
            <Col lg={{ span: 7, offset:0 }}>
                <Card className="select-plan-card selected">
                    <h3 className="select-plan-plan green">OPENSOURCE</h3>
                    <h1 className="select-plan-amount green">$0</h1>
                    <p className="select-plan-time green">per month</p>
                    <span>1 Project</span><br />
                    <span>1 Database</span><br />
                    <span>Community support</span><br />
                    <Button className="select-plan-button selected-button">Currently used</Button>
                </Card>
            </Col>
            <Col lg={{ span: 7, offset:1 }}>
                <Card className="select-plan-card">
                    <h3 className="select-plan-plan blue">PRO</h3>
                    <h1 className="select-plan-amount blue">$99</h1>
                    <p className="select-plan-time blue">per month</p>
                    <span>2 Projects</span><br />
                    <span>3 Databases/project</span><br />
                    <span>2 day priority email support</span><br />
                    <Button className="select-plan-button blue-button" onClick={props.handleProPlan}>Use this plan</Button>
                </Card>
            </Col>
            <Col lg={{ span: 7, offset:1 }}>
                <Card className="select-plan-card">
                    <h3 className="select-plan-plan purple">ENTERPRISE</h3>
                    <h1 className="select-plan-amount purple">$$$</h1>
                    <p className="select-plan-time purple">per month</p>
                    <span>Customize number of projects</span><br />
                    <span>Customize number of databases</span><br />
                    <span>Enterprise support </span><br />
                    <Button className="select-plan-button purple-button">Contact us</Button>
                </Card>
            </Col>
        </Row>
    );
}

export default SelectPlan;