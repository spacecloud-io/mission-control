import React from 'react';
import { Card, Divider, Progress } from 'antd';
import './current-estimation.css';

const CurrentEstimation = () => {
  return(
    <Card bordered className='cur-est'
      actions={[
        <Progress showInfo={false} percent={75} size='small' style={{ padding: '0 24px' }} />
    ]}>
      <h3>Current month estimated bill - $0.00</h3>
      <p style={{ marginTop: '24px', marginBottom: 0  }}>Project Name : $0</p>
      <Divider style={{ marginTop: 0, width: '10%' }} />
      <p>Database : $0</p>
      <p>RAM : $0</p>
      <p>Server space : $0</p>
    </Card>
  );
}

export default CurrentEstimation;