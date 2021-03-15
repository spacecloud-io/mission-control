import React, { useState } from 'react';
import { Button, Form } from 'antd';
import locksvg from '../../../assets/lock.svg';
import OtpInput from 'react-otp-input';

const VerifyForm = () => {

  const [code, setCode] = useState('');
  const [form] = Form.useForm();

  return(
    <div style={{ textAlign: 'center' }}>
      <img src={locksvg} style={{ height: '48px', width: '48px', marginTop: '32px', marginBottom: '8px'  }} />
      <p style={{ marginBottom: '8px' }}>Verification pending</p>
      <p>We have sent a 6 digit verification code to your email. Please enter it to verify.</p>
      <Form form={form}>
        <Form.Item name='code' rules={[{ required: true, message: 'Please enter six digit verification code' }]}>
          <OtpInput
            value={code}
            onChange={(code) => setCode(code)}
            numInputs={6}
            isInputNum={true}
            shouldAutoFocus={true}
            containerStyle={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}
            inputStyle={window.screen.width >= '992px' ? 
              { width: '50px', marginRight: '16px', borderTop: 'none transparent', borderLeft: 'none transparent', borderRight: 'none transparent', borderBottom: '1px solid #666666' } :
              { width: '30px', marginRight: '8px', borderTop: 'none transparent', borderLeft: 'none transparent', borderRight: 'none transparent', borderBottom: '1px solid #666666' }}
            focusStyle={{ outline: 'none', borderBottom: '1px solid #1D66FF' }}
          />
        </Form.Item>
        <Button type='primary' ghost style={{ marginTop: '16px', minWidth: '147px', width: '10%' }}>Verify</Button>
      </Form>
      <p style={{ margin: '24px 0' }}>Did not receive an OTP?  <a>Resend</a></p>
    </div>
  );
}

export default VerifyForm;