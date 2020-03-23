import React from 'react';
import { Card, Button } from 'antd';
import crown from '../../../assets/crown.svg'

const PlanDetails = (props) => {
    return(
        <Card>
            <h1 style={{marginBottom:0}}><b>Space Cloud Pro</b> <img src={crown} style={{marginLeft:"5%"}} /></h1>
            <p style={{marginTop:0}}>$199/month</p>
            <p style={{marginTop:"5%"}}><b>Details:</b></p>
            <p>Database limits: 5 databases</p>
            <p>Project limits: 3 projects</p>
            <p style={{marginBottom:"10%"}}>Cluster limits: 2 clusters</p>
            <Button type='primary' style={{width:"100%"}} onClick={props.handleIncreaseLimit}>Increase limits</Button>
        </Card>
    );
}

export default PlanDetails;