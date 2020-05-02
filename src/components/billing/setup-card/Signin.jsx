import React from 'react';
import { Card, Button } from 'antd';

const Signin = (props) => {
  return (
    <Card>
      <p style={{ fontSize: "16px", color: "rgba(0,0,0,0.87)" }}>Signin to your account</p>
      <p>You are currently logged out. Signin to manage your billing account and much more.</p>
      <Button type="primary" ghost style={{ marginTop: "24px", width: 160 }} onClick={props.handleSignin}>Signin</Button>
    </Card>
  );
}

export default Signin;