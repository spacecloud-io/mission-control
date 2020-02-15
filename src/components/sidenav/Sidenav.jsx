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
    const microservices = ["remote-services", "eventing", "deployments", "secrets", "routing"];
    if(props.selectedItem === "database" || props.selectedItem === "file-storage"){
      return "1"
    }
    else if(microservices.some(val => val === props.selectedItem)){
      return "2"
    }
  }

  const closeSidenav = () => {
    store.dispatch(set("uiState.showSidenav", false))
  }

  return (
    <React.Fragment>
    <div className={showSidenav?'overlay':'no-overlay'} onClick={()=>store.dispatch(set("uiState.showSidenav", false))}></div>
    <div className={showSidenav?'sidenav':'no-sidenav'}>
      <div style={{height: "92%", overflowY: "auto"}}>
        <Link to={`/mission-control/projects/${projectID}/overview`} onClick={closeSidenav}>
          <SidenavItem name="Overview" icon="home" active={props.selectedItem === 'overview'} />
        </Link>
        <Collapse 
         bordered={false}
         expandIconPosition="right"
         defaultActiveKey={setActiveKey()}
         expandIcon={({ isActive }) => <Icon type="down" rotate={isActive ? 180 : 0}/>}>
          <Panel header={<Header name="Storage" icon="dns"/>} key="1">
            <Link to={`/mission-control/projects/${projectID}/database`} onClick={closeSidenav}>
              <PanelItem name="Database" active={props.selectedItem === 'database'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/file-storage`} onClick={closeSidenav}>
              <PanelItem name="File Store" active={props.selectedItem === 'file-storage'} />
            </Link>
          </Panel>
          <Panel header={<Header name="Microservices" icon="widgets"/>} key="2">
            <Link to={`/mission-control/projects/${projectID}/remote-services`} onClick={closeSidenav}>
              <PanelItem name="GraphQL API" active={props.selectedItem === 'remote-services'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/eventing/overview`} onClick={closeSidenav}>
              <PanelItem name="Eventing" active={props.selectedItem === 'eventing'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/deployments`} onClick={closeSidenav}>
              <PanelItem name="Deployments" active={props.selectedItem === 'deployments'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/secrets`} onClick={closeSidenav}>
              <PanelItem name="Secrets" active={props.selectedItem === 'secrets'} />
            </Link>
            <Link to={`/mission-control/projects/${projectID}/routing`} onClick={closeSidenav}>
              <PanelItem name="Routing" active={props.selectedItem === 'routing'} />
            </Link>
          </Panel>
        </Collapse>
        <Link to={`/mission-control/projects/${projectID}/auth`} onClick={closeSidenav}>
          <SidenavItem name="Auth" icon="how_to_reg" active={props.selectedItem === 'auth'} />
        </Link>
        <Link to={`/mission-control/projects/${projectID}/explorer`} onClick={closeSidenav}>
          <SidenavItem name="API Explorer" icon="explore" active={props.selectedItem === 'explorer'} />
        </Link>
        <Divider />
        <Link to={`/mission-control/projects/${projectID}/guides`} onClick={closeSidenav}>
          <SidenavItem name="Guides" icon="import_contacts" active={props.selectedItem === 'guides'} />
        </Link>
        <Divider />
        <Link to={`/mission-control/projects/${projectID}/settings`} onClick={closeSidenav}>
          <SidenavItem name="Settings" icon="settings" active={props.selectedItem === 'settings'} />
        </Link>
        <Link to={`/mission-control/projects/${projectID}/teams`} onClick={closeSidenav}>
          <SidenavItem name="Teams" icon="people_alt" active={props.selectedItem === 'teams'} />
        </Link>
        {/* <Link to={`/mission-control/projects/${projectID}/billing`} onClick={closeSidenav}>
          <SidenavItem name="Billing" icon="attach_money" active={props.selectedItem === 'billing'} />
        </Link> */}
        </div>
        <div className="sidenav-version">
          SC v{version}
      </div>
      </div>
    </React.Fragment>
    )
}
export default Sidenav;