import React from 'react';
import { Card, Icon, Button } from 'antd';
import { Link } from 'react-router-dom';

const VerifyEmail = (props) => {
    return(
        <Card style={{ padding:"32px" }}>
            <Icon type="mail" style={{ fontSize:"30px", fontWeight:"bold", marginBottom:"2%" }} />
            <h2><b>Email verification pending</b></h2>
            <p style={{marginBottom:0, marginTop:"2%"}}>We have sent an verification link to your email. Please verify it to login.</p>
            <p style={{marginTop:0}}>Did not receive an email? <Link onClick={props.verify}> Resend verification link </Link></p>
            <Button type='primary' ghost style={{ marginTop:"3%", width:"50%" }} onClick={props.redirect}> Take me to Login page</Button>
        </Card>
    );
}

export default VerifyEmail;