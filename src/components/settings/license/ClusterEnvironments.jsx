import React from 'react';
import { Card, Typography } from 'antd';

const ClusterEnvironments = ({ licenseMode, sessionId }) => {
  return(
    <React.Fragment>
    <h2>Cluster environment</h2>
    <Card>
      <p style={{ marginBottom: 8 }}>License mode: {licenseMode}</p>
      {licenseMode === 'offline' && <p style={{ marginBottom: 8 }}>Session ID: <Typography.Text copyable ellipsis>{sessionId}</Typography.Text></p>}
    </Card>
    </React.Fragment>
  );
}

export default ClusterEnvironments;