import React from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Card, Button } from 'antd';

const Support = (props) => {
    return (
        <Card style={{backgroundColor:"#002C39", color:"#ffffff"}}>
            <h1 style={{marginBottom:0, color:"#ffffff"}}><b>Support</b></h1>
            <p style={{marginTop:0}}>Got stuck somewhere? We would love to help!</p>
            <p style={{marginTop:"12%", color:"rgba(255, 255, 255, 0.7)"}}>
                <CaretRightOutlined />
                <span style={{marginLeft:"2%"}} >Trouble using Space Cloud?</span>
            </p>
            <p style={{color:"rgba(255, 255, 255, 0.7)"}}>
                <CaretRightOutlined />
                <span style={{marginLeft:"2%"}}>Have any bugs / feature requests?</span>
            </p>
            <p style={{marginBottom:"10%", color:"rgba(255, 255, 255, 0.7)"}}>
                <CaretRightOutlined /> 
                <span style={{marginLeft:"2%"}}>Billing problem?</span>
            </p>
            <Button type='primary'ghost style={{width:"100%"}} onClick={props.handleContactUs}>Contact us</Button>
        </Card>
    );
}

export default Support;