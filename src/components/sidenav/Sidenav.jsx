import React from 'react'
import { Link } from 'react-router-dom';
import SidenavItem from './SidenavItem'
import './sidenav.css'
import { connect } from 'react-redux'
import { get } from 'automate-redux';

const Sidenav = (props) => {
  return(
    <div className="sidenav">
    <Link to={`/mission-control/projects/${props.projectId}/overview`}>
      <SidenavItem name="Project Overview" icon="home" active={props.selectedItem === 'overview'} />
    </Link>
    <Link to={`/mission-control/projects/${props.projectId}/database`}>
      <SidenavItem name="Database" icon="dns" active={props.selectedItem === 'database'} />
    </Link>
    <Link to={`/mission-control/projects/${props.projectId}/file-storage`}>
      <SidenavItem name="File Storage" icon="folder_open" active={props.selectedItem === 'file-storage'} />
    </Link>
    <Link to={`/mission-control/projects/${props.projectId}/event-triggers`}>
      <SidenavItem name="Event triggers" icon="near_me" active={props.selectedItem === 'event-triggers'} />
    </Link>
    <Link to={`/mission-control/projects/${props.projectId}/functions`}>
      <SidenavItem name="Remote Endpoints" icon="code" active={props.selectedItem === 'functions'} />
    </Link>
    <Link to={`/mission-control/projects/${props.projectId}/user-management`}>
      <SidenavItem name="User Management" icon="people" active={props.selectedItem === 'user-management'} />
    </Link>
    <Link to={`/mission-control/projects/${props.projectId}/explorer`}>
      <SidenavItem name="Explorer" icon="explore" active={props.selectedItem === 'explorer'} />
    </Link>
    <Link to={`/mission-control/projects/${props.projectId}/configure`}>
      <SidenavItem name="Configure" icon="settings" active={props.selectedItem === 'configure'} />
    </Link>
  </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    projectId: get(state, "config.id", ""),
    selectedItem: ownProps.selectedItem,
  }
}


export default connect(mapStateToProps)(Sidenav);