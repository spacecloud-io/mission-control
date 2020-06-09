import React from 'react';
import { Typography, Card } from 'antd';

const Credentials = ({credentials = {}}) => {
  
  return (
    <React.Fragment>
      <h2>Credentials</h2>
      <Card style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ wordSpacing: 6 }}>
          <b>Username </b>
          <Typography.Paragraph style={{ display: "inline" }} copyable ellipsis>{credentials.user}</Typography.Paragraph>
        </h3>
        <h3 style={{ wordSpacing: 6 }}>
          <b>Access Key </b>
          <Typography.Paragraph style={{ display: "inline" }} copyable={{ text: credentials.pass }} ellipsis>*************************</Typography.Paragraph>
        </h3>
      </Card>
    </React.Fragment>
  );
} 

export default Credentials;