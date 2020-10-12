import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Card, Row, Col, Button } from 'antd';
import upgradeSvg from '../../../assets/upgrade.svg';
import './upgrade.css';

const UpgradeCard = (props) => {

  return (
    <Card className="upgrade-card">
      <Row>
        <Col lg={{ span: 6 }} style={{ padding: "32px" }} md={{ span: 12, offset: 0 }}>
          <img src={upgradeSvg} />
        </Col>
        <Col lg={{ span: 17, offset: 1 }} md={{ span: 12 }}>
          <h2 className="upgrade-title" style={{ marginBottom: "0px" }}><b>Upgrade to Space Cloud Pro</b></h2>
          <p className="upgrade-content" >Avail all the exclusive features of Space Cloud for as low as $150/month</p>
          <div className="list-content"><CheckOutlined className="check-icon" /><span>Single control plane for multiple projects and databases</span></div>
          <div className="list-content"><CheckOutlined className="check-icon" /><span>Automated devops and canary deployments</span></div>
          <div className="list-content"><CheckOutlined className="check-icon" /><span>Team access control and audit trails</span></div>
          <Button type="primary" className="upgrade-btn" onClick={props.handleClickUpgrade} size="large">UPGRADE NOW - $150/month</Button>
        </Col>
      </Row>
    </Card>
  );
}

export default UpgradeCard;