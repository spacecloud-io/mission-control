import React from 'react';
import { Row, Col, Divider } from 'antd';
import KubernetesIcon from '../../../assets/kubernetesIcon.svg';
import dockerIcon from '../../../assets/dockerIcon.svg';
import mongoIcon from '../../../assets/mongoIcon.svg';
import postgresIcon from '../../../assets/postgresIcon.svg';
import mysqlIcon from '../../../assets/mysqlIcon.svg';
import sqlserverIcon from '../../../assets/sqlserverIcon.svg';
import logo from '../../../assets/logo-blue.svg';
import { CheckOutlined } from '@ant-design/icons';
import './content.css';

const Content = () => {
    return (
      <Row className="des-content">
        <Col lg={{ span: 22, offset: 1 }}>
          <img src={logo} style={{ height: '45px', width: '204px', marginTop: '80px' }}/>
          <p>Develop, Deploy & Secure your serverless apps</p>
          <Col lg={{ span: 24 }} xl={{ span: 18, offset: 3 }} style={{ marginBottom: "64px" }}>
            <p className="content-tagline">Open source Firebase + Heroku on Kubernetes! ❤️ </p>
            <div className="list-content"><CheckOutlined className="tools-icon" /> <span>Instant GraphQL APIs for databases and microservices</span></div>
            <div className="list-content"><CheckOutlined className="tools-icon" /> <span>Secure service mesh with end to end encryption</span></div>
            <div className="list-content"><CheckOutlined className="tools-icon" /> <span>Auto scaling, devops and canary deployments</span></div>
            <div className="list-content"><CheckOutlined className="tools-icon" /> <span>Unified control plane for all your clusters and projects</span></div>
          </Col>
          <Divider style={{ marginBottom: "64px"}}>Supported integrations</Divider>
          <div style={{ display: "flex", justifyContent: "space-evenly", marginBottom: '80px' }}>
            <img src={KubernetesIcon} width="40px" height="40px" />
            <img src={dockerIcon} width="40px" height="40px" />
            <img src={mongoIcon} width="40px" height="40px" />
            <img src={postgresIcon} width="40px" height="40px" />
            <img src={mysqlIcon} width="40px" height="40px" />
            <img src={sqlserverIcon} width="40px" height="40px" />
          </div>
        </Col>
      </Row>
    );
}

export default Content;