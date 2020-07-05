import React, { useState } from 'react';
import { Button, Divider, Radio, Table } from 'antd';
import elasticSearchSvg from '../../../assets/elasticSearch.svg';
import upLogo from '../../../logo.png';
import RadioCards from '../../radio-cards/RadioCards';
import { CheckOutlined, CloseOutlined, SwapOutlined, PropertySafetyFilled } from '@ant-design/icons';

const ElasticSearchPermission = (props) => {

  const [permissions, setPermissions] = useState('configPermission');

  const configColumns = [{
    title: 'Config',
    key: 'config',
    dataIndex: 'config'
  },{
    title: 'Read',
    key: 'read',
    dataIndex: 'read',
    render: (_, record) => {
      if(record.read){
        return <CheckOutlined style={{ color:'#52C41A' }} />
      }else{
        return <CloseOutlined style={{ color:'#FF4D4F' }} />
      }
    }
  },{
    title: 'Modify',
    key: 'modify',
    dataIndex: 'modify',
    render: (_, record) => {
      if(record.modify){
        return <CheckOutlined style={{ color:'#52C41A' }} />
      }else{
        return <CloseOutlined style={{ color:'#FF4D4F' }} />
      }
    }
  },{
    title: 'Webhook',
    key: 'webhook',
    dataIndex: 'webhook',
    render: (_, record) => {
      if(record.webhook){
        return <CheckOutlined style={{ color:'#52C41A' }} />
      }else{
        return <CloseOutlined style={{ color:'#FF4D4F' }} />
      }
    }
  },{
    title: 'Override',
    key: 'override',
    dataIndex: 'override',
    render: (_, record) => {
      if(record.override){
        return <CheckOutlined style={{ color:'#52C41A' }} />
      }else{
        return <CloseOutlined style={{ color:'#FF4D4F' }} />
      }
    }
  }];

  const apiColumns = [{
    title: 'API',
    key: 'api',
    dataIndex: 'api'
  },{
    title: 'Access',
    key: 'access',
    dataIndex: 'access',
    render: (_, record) => {
      if(record.access){
        return <CheckOutlined style={{ color:'#52C41A' }} />
      }else{
        return <CloseOutlined style={{ color:'#FF4D4F' }} />
      }
    }
  },{
    title: 'Webhook',
    key: 'webhook',
    dataIndex: 'webhook',
    render: (_, record) => {
      if(record.webhook){
        return <CheckOutlined style={{ color:'#52C41A' }} />
      }else{
        return <CloseOutlined style={{ color:'#FF4D4F' }} />
      }
    }
  },{
    title: 'Override',
    key: 'override',
    dataIndex: 'override',
    render: (_, record) => {
      if(record.override){
        return <CheckOutlined style={{ color:'#52C41A' }} />
      }else{
        return <CloseOutlined style={{ color:'#FF4D4F' }} />
      }
    }
  }];

  const configData = [{
    config: 'Database schema',
    read: true,
    modify: false,
    webhook: false,
    override: false
  },{
    config: 'Database schema',
    read: true,
    modify: false,
    webhook: false,
    override: false
  },{
    config: 'Database schema',
    read: true,
    modify: false,
    webhook: false,
    override: false
  },{
    config: 'Database schema',
    read: true,
    modify: true,
    webhook: false,
    override: false
  }]

  const apiData = [{
    api: 'Database schema',
    access: false,
    webhook: true,
    override: false
  },{
    api: 'Database schema',
    access: false,
    webhook: true,
    override: false
  },{
    api: 'Database schema',
    access: false,
    webhook: true,
    override: false
  },{
    api: 'Database schema',
    access: false,
    webhook: true,
    override: false
  }]

  return (
    <React.Fragment>
      <center>
        <img src={elasticSearchSvg} height='50px' width='50px' />
        <SwapOutlined style={{ fontSize:'30px', margin:'0px 16px 0 16px' }}/>
        <img src={upLogo} height='45px' width='45px' />
        <h3>Elastic search requires the following permissions</h3>
      </center>
      <Divider />
      <RadioCards size='mini'>
        <Radio.Button value='configPermission' onClick={() => setPermissions('configPermission')} size='small'>
          <span>Config permissions</span>
        </Radio.Button>
        <Radio.Button value='apiPermission' onClick={() => setPermissions('apiPermission')}>
          <span>API permissions</span>
        </Radio.Button>
      </RadioCards>
      {permissions === 'configPermission' && 
        <Table style={{ marginTop:'24px' }} columns={configColumns} dataSource={configData} bordered scroll={props.scroll} pagination={false} />}
      {permissions === 'apiPermission' && 
        <Table style={{ marginTop:'24px' }} columns={apiColumns} dataSource={apiData} bordered scroll={props.scroll} pagination={false} />}
    </React.Fragment>
  );
}

export default ElasticSearchPermission;