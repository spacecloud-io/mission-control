import React from 'react';
import { Card, Button, Row, Col } from 'antd';
import FormItemLabel from '../../../form-item-label/FormItemLabel';
import { dbTypes } from '../../../../constants';

const DriverConfig = ({ config, dbType, handleEditDriverConfig }) => {
  const maxConn = config && config.maxConn ? config.maxConn : 100
  const minConn = config && dbType === dbTypes.MONGO && config.minConn ? config.minConn : 10
  const maxIdleConn = config && dbType !== dbTypes.MONGO && config.maxIdleConn ? config.maxIdleConn : 50
  const maxIdleTimeout = config && config.maxIdleTimeout ? `${config.maxIdleTimeout/1000} seconds` : '300 seconds'

  return(
    <React.Fragment>
      <FormItemLabel name="Driver config" description="The config of the underlying database driver" />
      <Card style={{ border: '1px solid #F0F0F0', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
        <p style={{ marginBottom: 8 }}>Max connections: {maxConn}</p>
        {dbType === dbTypes.MONGO && <p style={{ marginBottom: 8 }}>Min connections: {minConn}</p>}
        {dbType !== dbTypes.MONGO && <p style={{ marginBottom: 8 }}>Max idle connections: {maxIdleConn}</p>}
        <p style={{ marginBottom: 24 }}>Max idle timeout: {maxIdleTimeout}</p>
        <Button onClick={handleEditDriverConfig}>Edit config</Button>
      </Card>
    </React.Fragment>
  );
}

export default DriverConfig;