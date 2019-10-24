import React from 'react'
import { Link, useParams } from 'react-router-dom';
import SidenavItem from './SidenavItem'
import './sidenav.css'

const Sidenav = (props) => {
  const { projectId } = useParams()
  return (
    <div className="sidenav">
      <Link to={`/mission-control/projects/${projectId}/overview`}>
        <SidenavItem name="Project Overview" icon="home" active={props.selectedItem === 'overview'} />
      </Link>
      <Link to={`/mission-control/projects/${projectId}/database`}>
        <SidenavItem name="Database" icon="dns" active={props.selectedItem === 'database'} />
      </Link>
      <Link to={`/mission-control/projects/${projectId}/file-storage`}>
        <SidenavItem name="File Storage" icon="folder_open" active={props.selectedItem === 'file-storage'} />
      </Link>
      <Link to={`/mission-control/projects/${projectId}/event-triggers`}>
        <SidenavItem name="Event triggers" icon="near_me" active={props.selectedItem === 'event-triggers'} />
      </Link>
      <Link to={`/mission-control/projects/${projectId}/functions`}>
        <SidenavItem name="Remote Endpoints" icon="code" active={props.selectedItem === 'functions'} />
      </Link>
      <Link to={`/mission-control/projects/${projectId}/user-management`}>
        <SidenavItem name="User Management" icon="people" active={props.selectedItem === 'user-management'} />
      </Link>
      <Link to={`/mission-control/projects/${projectId}/explorer`}>
        <SidenavItem name="Explorer" icon="explore" active={props.selectedItem === 'explorer'} />
      </Link>
      <Link to={`/mission-control/projects/${projectId}/configure`}>
        <SidenavItem name="Configure" icon="settings" active={props.selectedItem === 'configure'} />
      </Link>
    </div>
  )
}


export default Sidenav;