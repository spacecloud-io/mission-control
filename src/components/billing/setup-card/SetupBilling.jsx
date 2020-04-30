import React from 'react';
import { Card, Button } from 'antd';

const SetupBilling = (props) => {
    return(
        <Card>
            <p style={{ fontSize:"16px" }}>Setup your billing account</p>
            <p>Setting up your billing account allows you to upgrade your clusters to premium plans and access free credits</p>
            <Button type="primary" ghost style={{ marginTop:"32px", width:"188px"}} onClick={props.handleSetupBilling}>Setup billing</Button>
        </Card>
    );
}

export default SetupBilling;