import React, { useEffect } from 'react'
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import { RightOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import Email from '../../components/user-management/Email'
import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import mailIcon from '../../assets/mailIcon.svg'
import CollapseHeader from './CollapseHeader'
import './user-management.css'
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { saveUserManConfig, loadUserManConfig, getEmailConfig } from '../../operations/userMan';
import { projectModules, actionQueuedMessage } from '../../constants';
const { Panel } = Collapse;

//const Panel = Collapse.Panel;
const UserManagement = () => {
  // Router params
  const { projectID } = useParams()

  useEffect(() => {
    incrementPendingRequests()
    loadUserManConfig(projectID)
      .catch(ex => notify("error", "Error fetching user management config", ex))
      .finally(() => decrementPendingRequests())
  }, [projectID])

  const emailConfig = useSelector(state => getEmailConfig(state))

  // Handlers
  const handleProviderConfig = (provider, config) => {
    incrementPendingRequests()
    saveUserManConfig(projectID, provider, config)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Saved user management config successfully"))
      .catch(ex => notify("error", "Error saving user management config", ex))
      .finally(() => decrementPendingRequests())
  }

  return (
    <div className="user-management">
      <Topbar showProjectSelector />
      <div>
        <Sidenav selectedItem={projectModules.USER_MANAGEMENT} />
        <div className="page-content">
          <h2>Auth Providers</h2>
          <Collapse style={{ marginTop: 24 }} accordion expandIconPosition="right" expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 270 : 90} />}>
            <Panel header={(<div style={{ padding: "8px 0px 8px 16px" }}><CollapseHeader icon={mailIcon} desc="Mail" /></div>)} key="1">
              <div style={{ paddingLeft: 16 }}>
                <Email initialValues={emailConfig} handleSubmit={(config) => handleProviderConfig("email", config)} />
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;

