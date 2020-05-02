import React from 'react';
import { Modal } from 'antd';
import AddBillingDetails from './AddBillingDetails';
import { notify } from '../../../utils';

export default function AddBillingDetailsModal(props) {
  const handleSuccess = () => {
    props.handleCancel()
    notify("success", "Success", "Added billing details successfully")
  }
  return (
    <Modal
      visible={true}
      width='600px'
      onCancel={props.handleCancel}
      footer={null}
      className="signin-modal">
      <AddBillingDetails handleSuccess={handleSuccess} />
    </Modal>
  );
}
