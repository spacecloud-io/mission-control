import React from 'react'
import { Link, useParams } from 'react-router-dom';
import SidenavItem from './SidenavItem'
import './sidenav.css'
import { useSelector } from "react-redux";
import store from "../../store"
import { set, get } from "automate-redux"

const Sidenav = (props) => {
  const { projectID } = useParams()
  const showSidenav = useSelector(state => state.uiState.showSidenav)
  const version = useSelector(state => state.version)
  return (
    <React.Fragment>
    <div className={showSidenav?'overlay':'no-overlay'} onClick={()=>store.dispatch(set("uiState.showSidenav", false))}></div>
    <div className={showSidenav?'sidenav':'no-sidenav'} onClick={()=>store.dispatch(set("uiState.showSidenav", false))}>
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
        <div className="sidenav-version">
          SC v{version}
        </div>
      </div>
    
    </React.Fragment>
    )
}
export default Sidenav;