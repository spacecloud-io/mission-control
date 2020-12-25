import React from 'react';
import { Card, Button } from 'antd';
import FormItemLabel from '../../../form-item-label/FormItemLabel';

const BatchingConfig = ({ config, handleEditBatchingConfig }) => {
  const batchTime = config && config.batchTime ? config.batchTime : 200;
  const batchRecords = config && config.batchRecords ? config.batchRecords : 200;
  
  return(
    <React.Fragment>
      <FormItemLabel name="Batch config" description="The config of the underlying database batching config" />
      <Card style={{ border: '1px solid #F0F0F0', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
        <p style={{ marginBottom: 8 }}>Batch time: {batchTime}ms</p>
        <p style={{ marginBottom: 24 }}>Batch records: {batchRecords}</p>
        <Button onClick={handleEditBatchingConfig}>Edit config</Button>
      </Card>
    </React.Fragment>
  );
}

export default BatchingConfig;  