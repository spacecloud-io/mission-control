import React from 'react';
import { Alert, Modal, Icon } from 'antd';
import './register-cluster.css';

const ExistingClusterName = (props) => {

    const alertMsg = <div>
         You have already registered a cluster with the <a>Testing Cluster</a> name in the past. <br /><br/>
Continuing with this name for this cluster will cause any previously running cluster with the same name to be switched back to the open source plan.
        </div>

    return(
        <Modal 
            visible={props.modalVisible} 
            cancelText="Change name" 
            okText="Continue with the name"
            onOk={props.handleContinueName}
            onCancel={props.handleChangeName}
            className="cluster-name-modal"
            width='600px'
            style={{ padding: "32px 28px 0px 28px" }}>
                <Icon type="info-circle" style={{fontSize:"24px", color: '#F9AE3A' }} /> 
                <span style={{ fontSize:'16px', marginLeft:'16px'  }}>Cluster name already in use</span><br />
                <Alert 
                    message=" " 
                    description={alertMsg} 
                    type="warning" 
                    style={{ marginLeft:'40px', marginTop:'12px'  }} />
        </Modal>
    );
}

export default ExistingClusterName;