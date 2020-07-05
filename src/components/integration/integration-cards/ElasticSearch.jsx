import React from 'react';
import { Card, Button, Popover } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import ElasticSearchSvg from '../../../assets/elasticSearch.svg';
import OptionSvg from '../../../assets/3dots.svg';
import CardOption from './CardOption';

const ElasticSearch = (props) => {

  const history = useHistory();
  const { projectID } = useParams();

  return (
    <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
      <center><img src={ElasticSearchSvg} /></center> 
      {props.installed && <Popover content={<CardOption />} trigger='click' placement='bottomLeft'>
        <img src={OptionSvg} style={{ textAlign:'right', position:'absolute', right: '8px', top:'24px', cursor:'pointer' }} />
      </Popover>} 
      <center><h3 style={{ marginTop:'24px', marginBottom:'8px' }}>Elastic search</h3>
      <p style={{ marginBottom: '46px' }}>Add search capabilities for your app powered by Elastic Search</p>
      {!props.installed && <Button type='primary' ghost onClick={() => history.push(`/mission-control/projects/${projectID}/integration/details/${'elasticSearch'}`)}>Install</Button>}
      {props.installed && <Button type='primary' ghost>Open console</Button>}</center>
    </Card>
  );
}

export default ElasticSearch;