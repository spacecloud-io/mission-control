import React from 'react';
import { Card, Button } from 'antd';

const Signin = (props) => {
    return(
        <Card>
            <p style={{ fontSize:"16px" }}>Signin to your account</p>
            <p>You are currently logged out. Signin to manage your billing account and much more.</p>
            <Button type="primary" ghost style={{ marginTop:"32px", width:"188px"}} onClick={props.handleSigin}>Signin</Button>
        </Card>
    );
}

export default Signin;