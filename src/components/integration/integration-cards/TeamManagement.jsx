import React from 'react';
import { Card, Button, Popover } from 'antd';
import TeamManagementSvg from '../../../assets/teamManagement.svg';
import OptionSvg from '../../../assets/3dots.svg';
import CardOption from './CardOption';

const TeamManagement = (props) => {
  return (
    <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
      <center><img src={TeamManagementSvg} /></center> 
      {props.installed && <Popover content={<CardOption />} trigger='click' placement='bottomLeft'>
        <img src={OptionSvg} style={{ textAlign:'right', position:'absolute', right: '8px', top:'24px', cursor:'pointer' }} />
      </Popover>} 
      <center><h3 style={{ marginTop:'21px', marginBottom:'8px' }}>Team management</h3>
      <p style={{ marginBottom: '28px' }}>Enterprise grade team management module for granular login permissions and much more</p>
      {!props.installed && <Button type='primary' ghost>Install</Button>}
      {props.installed && <Button type='primary' ghost>Open console</Button>}</center>
    </Card>
  );
}

export default TeamManagement;