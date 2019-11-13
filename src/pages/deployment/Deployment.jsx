import React, { useState } from 'react';
import DeploymentForm from '../../components/deployment/DeploymentForm';

import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';

import {Button} from 'antd'

export default () => {

  const [modalVisible, setModalVisibile] = useState(false);
  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="deployment" />
      <div className="page-content">
        <div style={{ marginTop: 24 }}>
          <div className="panel" style={{ margin: 24 }}>
            {/* <img src={eventTriggersSvg} width="60%" /> */}
            <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Deploy your stateless containers in a serverless fashion. Don't worry, you only pay when its used.</p>
            <Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setModalVisibile(true)}>Add Deployment</Button>
          </div>
        </div>
      </div>
      {modalVisible &&
        <DeploymentForm
          visible={modalVisible}
          handleCancel={() => setModalVisibile(false)}
        />}
    </div>
  )
}