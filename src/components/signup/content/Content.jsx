import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Row, Col, Divider } from 'antd';
import KubernetesIcon from '../../../assets/kubernetesIcon.svg';
import dockerIcon from '../../../assets/dockerIcon.svg';
import mongoIcon from '../../../assets/mongoIcon.svg';
import postgresIcon from '../../../assets/postgresIcon.svg';
import mysqlIcon from '../../../assets/mysqlIcon.svg';
import sqlserverIcon from '../../../assets/sqlserverIcon.svg';
import './content.css';

const Content = () => {
    return (
        <Row className="des-content">
            <Col lg={{ span: 22, offset: 1 }}>
                <h1 className="content-title">Space Cloud</h1>
                <p className="content-tagline">Open source Firebase + Heroku on Kubernetes! ❤️ </p>
                <Col lg={{ span: 16, offset: 4 }} style={{ marginBottom: "10%" }}>
                    <div className="list-content"><CheckOutlined className="tools-icon" /> <span>Instant GraphQL APIs for databases and microservices</span></div>
                    <div className="list-content"><CheckOutlined className="tools-icon" /> <span>Secure service mesh with end to end encryption</span></div>
                    <div className="list-content"><CheckOutlined className="tools-icon" /> <span>Auto scaling, devops and canary deployments</span></div>
                    <div className="list-content"><CheckOutlined className="tools-icon" /> <span>Unified control plane for all your clusters and projects</span></div>
                </Col>
                <Divider style={{ marginBottom: "10%", color: "#002C39" }}>Supported integrations</Divider>
                <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <img src={KubernetesIcon} width="48px" height="48px" />
                    <img src={dockerIcon} width="48px" height="48px" />
                    <img src={mongoIcon} width="48px" height="48px" />
                    <img src={postgresIcon} width="48px" height="48px" />
                    <img src={mysqlIcon} width="48px" height="48px" />
                    <img src={sqlserverIcon} width="48px" height="48px" />
                </div>
            </Col>
        </Row>
    );
}

export default Content;