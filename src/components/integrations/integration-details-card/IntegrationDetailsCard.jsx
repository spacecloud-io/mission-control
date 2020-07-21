import React from 'react';
import { Card, Divider, Button } from 'antd';
import ReactMarkdown from 'react-markdown';

const IntegrationDetailsCard = ({ name, imgUrl, details, installed, handleInstallClick, handleOpenConsole }) => {
  return (
    <Card bordered style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}>
      <center>
        <img src={imgUrl} style={{ height: 40, width: 40, display: 'inline' }} />
        <h3 style={{ display: 'inline', fontSize: '18px', marginLeft: '16px' }}>{name}</h3>
      </center>
      <Divider />
      <ReactMarkdown source={details} />
      <div style={{ marginTop: 40 }}>
        {!installed && <Button type='primary' block size="large" onClick={handleInstallClick}>Install</Button>}
        {installed && <Button type='primary' block size="large" onClick={handleOpenConsole}>Open console</Button>}
      </div>
    </Card>
  );
}

export default IntegrationDetailsCard;