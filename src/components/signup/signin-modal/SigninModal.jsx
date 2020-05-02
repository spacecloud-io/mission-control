import React from 'react';
import { Modal } from 'antd';
import SigninCard from '../signin-card/SigninCard';
import './signin-modal.css';

function SigninModal(props) {
  return (
    <Modal
      visible={true}
      width='600px'
      onCancel={props.handleCancel}
      footer={null}
      className="signin-modal">
      <SigninCard handleSignin={props.handleSignin} />
    </Modal>
  );
}

export default SigninModal;