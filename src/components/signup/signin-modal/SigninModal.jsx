import React from 'react';
import { Modal } from 'antd';
import SigninCard from '../signin-card/SigninCard';
import './signin-modal.css';

const SigninModal = (props) => {

    return(
        <Modal 
            visible="true"
            width='600px'
            onCancel={props.handleCancel}
            footer={null}
            className="signin-modal">
                <SigninCard />
        </Modal>
    );
}

export default SigninModal;