import React from 'react';
import { Card, Divider, Button } from 'antd';
import ReactMarkdown from 'react-markdown';
import elasticSearchSvg from '../../../assets/elasticSearch.svg'
import { useHistory, useParams } from 'react-router-dom';

const ElasticSearchDetails = (props) => {

  const { projectID } = useParams();
  const history = useHistory();
  const description = '### Description: \n Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more';
  const install = '### install: \n Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more';
  const note = '### Note: \n Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more';
  const requirement = '### Requirement: \n\n 1. deployment(0.1 cpu, 200 MB RAM)';
  return (
    <Card bordered style={{ boxShadow:'0px 2px 4px rgba(0, 0, 0, 0.25)' }}>
      <center>
        <img src={elasticSearchSvg} style={{ height:'38px', width: '38px', display:'inline' }}/>
        <h3 style={{ display:'inline', fontSize:'18px', marginLeft:'16px' }}>Elastic search</h3>
      </center>
      <Divider />
      <ReactMarkdown source={description} />
      <ReactMarkdown source={install} />
      <ReactMarkdown source={note} />
      <ReactMarkdown source={requirement} />
      {!props.installed && <Button type='primary' style={{ width:'100%' }} onClick={() => history.push(`/mission-control/projects/${projectID}/integration/install/${'elasticSearch'}`)}>Install</Button>}
      {props.installed && <Button type='primary' ghost style={{ width:'100%' }}>Open console</Button>}
    </Card>
  );
}

export default ElasticSearchDetails;