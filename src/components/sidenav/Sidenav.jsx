import React from 'react'
import { Link, useParams } from 'react-router-dom';
import SidenavItem from './SidenavItem'
import './sidenav.css'
import { Collapse } from 'antd';
import { useSelector } from "react-redux";
import store from "../../store"
import { set } from "automate-redux"
const { Panel } = Collapse;

const Sidenav = (props) => {
  const { projectID } = useParams()
  const showSidenav = useSelector(state => state.uiState.showSidenav)
  return (
    <div className={showSidenav ? 'overlay' : 'no-overlay'} onClick={() => store.dispatch(set("uiState.showSidenav", false))}>
    <div className={showSidenav ? 'sidenav' : 'no-sidenav'} onClick={() => store.dispatch(set("uiState.showSidenav", false))}>
      <Collapse accordion expandIconPosition="right">
        <Panel header="Develop" className="title">
          <Link to={`/mission-control/projects/${projectID}/overview`}>
            <SidenavItem name="Project Overview" icon="home" active={props.selectedItem === 'overview'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/database`}>
            <SidenavItem name="Database" icon="dns" active={props.selectedItem === 'database'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/file-storage`}>
            <SidenavItem name="File Storage" icon="folder_open" active={props.selectedItem === 'file-storage'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/event-triggers`}>
            <SidenavItem name="Event triggers" icon="near_me" active={props.selectedItem === 'event-triggers'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/remote-services`}>
            <SidenavItem name="Remote Services" icon="code" active={props.selectedItem === 'services'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/user-management`}>
            <SidenavItem name="User Management" icon="people" active={props.selectedItem === 'user-management'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/explorer`}>
            <SidenavItem name="Explorer" icon="explore" active={props.selectedItem === 'explorer'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/configure`}>
            <SidenavItem name="Configure" icon="settings" active={props.selectedItem === 'configure'} />
          </Link>
        </Panel>
        <Panel header="Manage" className="title">
          <Link to={`/mission-control/projects/${projectID}/manage-services`}>
            <SidenavItem name="Manage Services" icon="flare" active={props.selectedItem === 'manage-services'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/deployments`}>
            <SidenavItem name="Deployments" icon="near_me" active={props.selectedItem === 'deployments'} />
          </Link>
        </Panel>
      </Collapse>
    </div>
    </div>
  )
}
export default Sidenav;