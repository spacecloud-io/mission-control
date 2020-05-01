import React from 'react';
import { Row, Col, Card, Avatar, Icon } from 'antd';

const MessageCard = () => {
    
    return(
        <Row>
            <Col xl={{ span: 10, offset:7 }} lg={{ span: 18, offset: 3}}>
                <Card style={{ borderRadius: '10px', padding:'24px', textAlign: "center", marginBottom:"32px"}}>
                     <Avatar size={64} style={{ backgroundColor:'rgba(255, 103, 0, 0.2)' }}>
                         <Icon type="mail"  style={{ fontSize:"20px" }}/> 
                    </Avatar>
                     <p style={{ fontSize:"16px", marginTop:"24px" }}>Have any questions or grievances?</p>
                     <p style={{ fontSize:"14px" }}>Shoot us a message and we will help you out ASAP! Promise ❤️</p>
                </Card>
            </Col>
        </Row>
    );
}

export default MessageCard;