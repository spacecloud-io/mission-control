import React from 'react';
import { Card, Button, Row, Col } from 'antd';
import FormItemLabel from '../../../form-item-label/FormItemLabel';

const DriverConfig = ({ config, dbType, handleEditDriverConfig }) => {
  const maxConn = config && config.maxConn ? config.maxConn : 100
  const minConn = config && dbType === 'mongo' && config.minConn ? config.minConn : 10
  const maxIdleConn = config && dbType !== 'mongo' && config.maxIdleConn ? config.maxIdleConn : 50
  const maxIdleTimeout = config && config.maxIdleTimeout ? `${config.maxIdleTimeout}ms` : '300ms'

  return(
    <Row>
      <Col span={12}>
        <FormItemLabel name="Driver config" description="The config of the underlying database driver" />
        <Card style={{ border: '1px solid #F0F0F0', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
          <p style={{ marginBottom: 8 }}>Max connections: {maxConn}</p>
          {dbType === 'mongo' && <p style={{ marginBottom: 8 }}>Min connections: {minConn}</p>}
          {dbType !== 'mongo' && <p style={{ marginBottom: 8 }}>max idle connections: {maxIdleConn}</p>}
          <p style={{ marginBottom: 24 }}>Max idle timeout: {maxIdleTimeout}</p>
          <Button onClick={handleEditDriverConfig}>Edit config</Button>
        </Card>
      </Col>
    </Row>
  );
}

export default DriverConfig;