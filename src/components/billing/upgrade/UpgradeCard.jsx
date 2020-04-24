import React from 'react';
import { Card, Row, Col, Icon, Button } from 'antd';
import upgradeSvg from '../../../assets/upgrade.svg';
import './upgrade.css';

const UpgradeCard = (props) => {

    return (
        <Row className="upgrade">
            <Col lg={{ span: 7, offset:0 }}>
                <Card className="upgrade-card">
                    <h3 className="upgrade-plan green">OPENSOURCE</h3>
                    <h1 className="upgrade-amount green">$0</h1>
                    <p className="upgrade-time green">per month</p>
                    <span>1 Project</span><br />
                    <span>1 Database</span><br />
                    <span>Community support</span><br />
                    <Button className="upgrade-button">Currently used</Button>
                </Card>
            </Col>
            <Col lg={{ span: 7, offset:1 }}>
                <Card className="upgrade-card">
                    <h3 className="upgrade-plan blue">PRO</h3>
                    <h1 className="upgrade-amount blue">$99</h1>
                    <p className="upgrade-time blue">per month</p>
                    <span>2 Projects</span><br />
                    <span>3 Databases/project</span><br />
                    <span>2 day priority email support</span><br />
                    <Button className="upgrade-button blue-button">Use this plan</Button>
                </Card>
            </Col>
            <Col lg={{ span: 7, offset:1 }}>
                <Card className="upgrade-card">
                    <h3 className="upgrade-plan purple">ENTERPRISE</h3>
                    <h1 className="upgrade-amount purple">$$$</h1>
                    <p className="upgrade-time purple">per month</p>
                    <span>Customize number of projects</span><br />
                    <span>Customize number of databases</span><br />
                    <span>Enterprise support </span><br />
                    <Button className="upgrade-button purple-button">Contact us</Button>
                </Card>
            </Col>
        </Row>
    );
}

export default UpgradeCard;