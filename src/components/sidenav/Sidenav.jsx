import React from 'react'
import { Link, useParams } from 'react-router-dom';
import SidenavItem from './SidenavItem'
import './sidenav.css'
import { useSelector } from "react-redux";
import store from "../../store"
import { set } from "automate-redux"
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Collapse, Divider } from "antd";
import { capitalizeFirstCharacter } from '../../utils';
import { getEnv } from '../../operations/cluster';
const { Panel } = Collapse;

const Header = ({ name, icon }) => {

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
const getPlanName = (planId) => {
  if (!planId) return "Opensource"
  // Strip the monthly/yearly and inr details from the plan id
  const temp = planId.split("--")[0]
  // Remove the space-cloud- prefix
  let plan = temp.replace("space-cloud-", "")
  if (plan === "open") plan = "opensource"
  // Make first letter of each word capital. eg my-custom -> My Custom
  const planName = plan.split("-").map(s => capitalizeFirstCharacter(s)).join(" ")
  return planName
}
const Sidenav = (props) => {
  const { projectID } = useParams()
  const showSidenav = useSelector(state => state.uiState.showSidenav)
  const sideNavActiveKeys = useSelector(state => state.uiState.sideNavActiveKeys)
  const { plan, version } = useSelector(state => getEnv(state))
  const planName = getPlanName(plan)
  const closeSidenav = () => {
    store.dispatch(set("uiState.showSidenav", false))
  }

  const setActiveKeys = (activeKeys) => {
    store.dispatch(set("uiState.sideNavActiveKeys", activeKeys))
  }

  return (
    <div className="sidenav-container">
      <div className={showSidenav ? 'overlay' : 'no-overlay'} onClick={() => store.dispatch(set("uiState.showSidenav", false))}></div>
      <div className={showSidenav ? 'sidenav' : 'no-sidenav'}>
        <div style={{ overflowY: "auto" }}>
          <Link to={`/mission-control/projects/${projectID}/overview`} onClick={closeSidenav}>
            <SidenavItem name="Overview" icon="home" active={props.selectedItem === 'overview'} />
          </Link>
          <Collapse
            bordered={false}
            expandIconPosition="right"
            onChange={setActiveKeys}
            activeKey={sideNavActiveKeys}
            expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}>
            <Panel header={<Header name="Storage" icon="dns" />} key="1">
              <Link to={`/mission-control/projects/${projectID}/database`} onClick={closeSidenav}>
                <PanelItem name="Database" active={props.selectedItem === 'database'} />
              </Link>
              <Link to={`/mission-control/projects/${projectID}/file-storage`} onClick={closeSidenav}>
                <PanelItem name="File Store" active={props.selectedItem === 'file-storage'} />
              </Link>
            </Panel>
            <Panel header={<Header name="Microservices" icon="widgets" />} key="2">
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
              <Link to={`/mission-control/projects/${projectID}/ingress-routes`} onClick={closeSidenav}>
                <PanelItem name="Ingress Routing" active={props.selectedItem === 'routing'} />
              </Link>
            </Panel>
          </Collapse>
          <Link to={`/mission-control/projects/${projectID}/userman`} onClick={closeSidenav}>
            <SidenavItem name="Auth" icon="how_to_reg" active={props.selectedItem === 'userman'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/integrations`} onClick={closeSidenav}>
            <SidenavItem name="Integrations" icon="extension" active={props.selectedItem === 'integrations'} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/explorer`} onClick={closeSidenav}>
            <SidenavItem name="API Explorer" icon="explore" active={props.selectedItem === 'explorer'} />
          </Link>
          <Divider />
          <Link to={`/mission-control/projects/${projectID}/settings`} onClick={closeSidenav}>
            <SidenavItem name="Settings" icon="settings" active={props.selectedItem === 'settings'} />
          </Link>
        </div>
        <div className="sidenav-version">
          <InfoCircleOutlined style={{ fontSize: "20px", fontWeight: "700" }} />
          <span className="version-no">Version - v{version}</span>
          <br />
          <span className="plan">{planName}</span>
        </div>
      </div>
    </div>
  );
}
export default Sidenav;