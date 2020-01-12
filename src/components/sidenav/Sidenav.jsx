import React from 'react'
import { Link, useParams } from 'react-router-dom';
import SidenavItem from './SidenavItem'
import './sidenav.css'
import { useSelector } from "react-redux";
import store from "../../store"
import { set, get } from "automate-redux"
import {Collapse, Divider, Icon} from "antd";
const {Panel} = Collapse;

const Header = ({name, icon}) => {

  return (
    <div className="sidenav-item">
      <i className="material-icons-outlined sidenav-item__icon">{icon}</i>
      <span className="sidenav-item__name">{name}</span>
  </div>
  )
}

const PanelItem = (props) => {

  return (
    <div className={
      props.active ? 'sidenav-item sidenav-item--active' : 'sidenav-item'
    } >
      <i className="material-icons-outlined sidenav-item__icon">{props.icon}</i>
      <span className="sidenav-collapsed-item__name">{props.name}</span>
  </div>
  )
}

const Sidenav = (props) => {
  const { projectID } = useParams()
  const showSidenav = useSelector(state => state.uiState.showSidenav)
  const version = useSelector(state => state.version)

  const setActiveKey = () => {
    const microservices = ["graphql", "event-triggers", "deployments", "secrets", "routing"];
    if(props.selectedItem === "database" || props.selectedItem === "file-storage"){
      return "1"
    }
    else if(microservices.some(val => val === props.selectedItem)){
      return "2"
    }
  }
  return (
    <React.Fragment>
    <div className={showSidenav?'overlay':'no-overlay'} onClick={()=>store.dispatch(set("uiState.showSidenav", false))}></div>
    <div className={showSidenav?'sidenav':'no-sidenav'} onClick={()=>store.dispatch(set("uiState.showSidenav", false))}>
      <div style={{height: "92%", overflowY: "auto"}}>
        <Link to={`/mission-control/projects/${projectID}/overview`}>
          <SidenavItem name="Overview" icon="home" active={props.selectedItem === 'overview'} />
        </Link>
        <Collapse 
         bordered={false}
         expandIconPosition="right"
         defaultActiveKey={setActiveKey()}
         expandIcon={({ isActive }) => <Icon type="down" rotate={isActive ? 180 : 0}/>}>
          <Panel header={<Header name="Storage" icon="dns"/>} key="1">
            <Link to={`/mission-control/projects/${projectID}/database`}>
              <PanelItem name="Database" active={props.selectedItem === 'database'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/file-storage`}>
              <PanelItem name="File Store" active={props.selectedItem === 'file-storage'} />
            </Link>
          </Panel>
          <Panel header={<Header name="Microservices" icon="widgets"/>} key="2">
            <Link to={`/mission-control/projects/${projectID}/graphql`}>
              <PanelItem name="GraphQL API" active={props.selectedItem === 'graphql'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/event-triggers`}>
              <PanelItem name="Event Triggers" active={props.selectedItem === 'event-triggers'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/deployments`}>
              <PanelItem name="Deployments" active={props.selectedItem === 'deployments'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/secrets`}>
              <PanelItem name="Secrets" active={props.selectedItem === 'secrets'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/routing`}>
              <PanelItem name="Routing" active={props.selectedItem === 'routing'} />
            </Link>
          </Panel>
        </Collapse>
        <Link to={`/mission-control/projects/${projectID}/auth`}>
          <SidenavItem name="Auth" icon="how_to_reg" active={props.selectedItem === 'auth'} />
        </Link>
        <Link to={`/mission-control/projects/${projectID}/explorer`}>
          <SidenavItem name="API Explorer" icon="explore" active={props.selectedItem === 'explorer'} />
        </Link>
        <Divider />
        <Link to={`/mission-control/projects/${projectID}/guides`}>
          <SidenavItem name="Guides" icon="import_contacts" active={props.selectedItem === 'guides'} />
        </Link>
        <Divider />
        <Link to={`/mission-control/projects/${projectID}/settings`}>
          <SidenavItem name="Settings" icon="settings" active={props.selectedItem === 'settings'} />
        </Link>
        <Link to={`/mission-control/projects/${projectID}/teams`}>
          <SidenavItem name="Teams" icon="people_alt" active={props.selectedItem === 'teams'} />
        </Link>
        <Link to={`/mission-control/projects/${projectID}/billing`}>
          <SidenavItem name="Billing" icon="attach_money" active={props.selectedItem === 'billing'} />
        </Link>
        </div>
        <div className="sidenav-version">
          SC v{version}
      </div>
      </div>
    </React.Fragment>
    )
}
export default Sidenav;