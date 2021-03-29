import React from 'react';
import { Card, Col, Row } from 'antd';
import portfolioSvg from '../../../assets/portfolio.svg';

const ProjectCard = ({ projectName }) => {
  return(
    <Card bordered title={<Card.Meta 
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      title={projectName}
      avatar={<img src={portfolioSvg} />}
    />}
    style={{ textAlign: 'left', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)' }}
    headStyle={{ borderBottom: '0.3px dashed #333333' }}>
      <Row gutter={16}>
        <Col xs={{ span: 12, offset: 0}}>
          <p>Database : 4</p>
        </Col>
        <Col xs={{ span: 12, offset: 0 }}>
          <p>Microservices : 14</p>
        </Col>
        <Col xs={{ span: 12, offset: 0 }}>
          <p>Users : 6</p>
        </Col>
        <Col xs={{ span: 12, offset: 0 }}>
          <p>Space Used : 6GB</p>
        </Col>
        <Col xs={{ span: 24, offset: 0 }}>
          <p>Last visited on : 3 Mar 2021 23:45</p>
        </Col>  
      </Row>
    </Card>
  );
}

export default ProjectCard;