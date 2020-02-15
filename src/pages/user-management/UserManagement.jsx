import React, { useEffect } from 'react'
import { useParams } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector, useDispatch } from 'react-redux'
import { Collapse, Icon } from 'antd';
import Email from '../../components/user-management/Email'
import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import mailIcon from '../../assets/mailIcon.svg'
import CollapseHeader from './CollapseHeader'
import './user-management.css'
import { decrement, increment } from 'automate-redux';
import { setProjectConfig, notify, getProjectConfig } from '../../utils';
import client from "../../client"
const { Panel } = Collapse;

//const Panel = Collapse.Panel;
const UserManagement = () => {
  // Router params
  const { projectID } = useParams()

  useEffect(() => {
    ReactGA.pageview("/projects/user-management");
  }, [])

  const dispatch = useDispatch()

  // Global state
  const projects = useSelector(state => state.projects)

  // Derived properties
  const emailConfig = getProjectConfig(projects, projectID, "modules.auth.email", {})

  // Handlers
  const handleProviderConfig = (provider, config) => {
    dispatch(increment("pendingRequests"))
    client.userManagement.setUserManConfig(projectID, provider, config)
      .then(() => {
        setProjectConfig(projectID, `modules.auth.${provider}`, config)
        notify("success", "Success", "Saved auth config successfully")
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  return (
    <div className="user-management">
      <Topbar showProjectSelector />
      <div>
        <Sidenav selectedItem="auth" />
        <div className="page-content">
          <h2>Auth Providers</h2>
          <Collapse style={{ marginTop: 24 }} accordion expandIconPosition="right" expandIcon={({ isActive }) => <Icon type="right" rotate={isActive ? 270 : 90} />}>
            <Panel header={(<div style={{ padding: "8px 0px 8px 16px" }}><CollapseHeader icon={mailIcon} desc="Mail" /></div>)} key="1">
              <div style={{ paddingLeft: 16 }}>
                <Email initialValues={emailConfig} handleSubmit={(config) => handleProviderConfig("email", config)} />
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    </div>
  )
}

export default UserManagement;

