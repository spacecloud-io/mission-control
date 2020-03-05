import React from 'react';
import { Card, Button } from 'antd';

const Support = (props) => {
    return(
        <Card style={{backgroundColor:"#002C39", color:"#ffffff"}}>
            <h1 style={{marginBottom:0, color:"#ffffff"}}><b>Support</b></h1>
            <p style={{marginTop:0}}>Got stuck somewhere? We would love to help!</p>
            <p style={{marginTop:"12%"}}>Trouble using Space Cloud?</p>
            <p>Have any bugs / feature requests?</p>
            <p style={{marginBottom:"10%"}}>Billing problem?</p>
            <Button type='primary'ghost style={{width:"100%"}} onClick={props.contact}>Contact us</Button>
        </Card>
    );
}

export default Support;