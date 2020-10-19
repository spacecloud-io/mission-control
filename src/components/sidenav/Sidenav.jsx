import React from 'react'
import { Link, useParams } from 'react-router-dom';
import SidenavItem from './SidenavItem'
import './sidenav.css'
import { useSelector } from "react-redux";
import store from "../../store"
import { set } from "automate-redux"
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Collapse, Divider, Typography, Space } from "antd";
import { capitalizeFirstCharacter } from '../../utils';
import { getEnv } from '../../operations/cluster';
import { projectModules } from '../../constants';
import { version as uiVersion } from '../../../package.json';
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
          <Link to={`/mission-control/projects/${projectID}/${projectModules.OVERVIEW}`} onClick={closeSidenav}>
            <SidenavItem name="Overview" icon="home" active={props.selectedItem === projectModules.OVERVIEW} />
          </Link>
          <Collapse
            bordered={false}
            expandIconPosition="right"
            onChange={setActiveKeys}
            activeKey={sideNavActiveKeys}
            expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}>
            <Panel header={<Header name="Storage" icon="dns" />} key="1">
              <Link to={`/mission-control/projects/${projectID}/${projectModules.DATABASE}`} onClick={closeSidenav}>
                <PanelItem name="Database" active={props.selectedItem === projectModules.DATABASE} />
              </Link>
              <Link to={`/mission-control/projects/${projectID}/${projectModules.FILESTORE}`} onClick={closeSidenav}>
                <PanelItem name="File Store" active={props.selectedItem === projectModules.FILESTORE} />
              </Link>
              <Link to={`/mission-control/projects/${projectID}/${projectModules.CACHE}`} onClick={closeSidenav}>
                <PanelItem name="Cache" active={props.selectedItem === projectModules.CACHE} />
              </Link>
            </Panel>
            <Panel header={<Header name="Microservices" icon="widgets" />} key="2">
              <Link to={`/mission-control/projects/${projectID}/${projectModules.REMOTE_SERVICES}`} onClick={closeSidenav}>
                <PanelItem name="GraphQL API" active={props.selectedItem === projectModules.REMOTE_SERVICES} />
              </Link>
              <Link to={`/mission-control/projects/${projectID}/${projectModules.EVENTING}`} onClick={closeSidenav}>
                <PanelItem name="Eventing" active={props.selectedItem === projectModules.EVENTING} />
              </Link>
              <Link to={`/mission-control/projects/${projectID}/${projectModules.DEPLOYMENTS}`} onClick={closeSidenav}>
                <PanelItem name="Deployments" active={props.selectedItem === projectModules.DEPLOYMENTS} />
              </Link>
              <Link to={`/mission-control/projects/${projectID}/${projectModules.SECRETS}`} onClick={closeSidenav}>
                <PanelItem name="Secrets" active={props.selectedItem === projectModules.SECRETS} />
              </Link>
              <Link to={`/mission-control/projects/${projectID}/${projectModules.INGRESS_ROUTES}`} onClick={closeSidenav}>
                <PanelItem name="Ingress Routing" active={props.selectedItem === projectModules.INGRESS_ROUTES} />
              </Link>
            </Panel>
          </Collapse>
          <Link to={`/mission-control/projects/${projectID}/${projectModules.USER_MANAGEMENT}`} onClick={closeSidenav}>
            <SidenavItem name="Auth" icon="how_to_reg" active={props.selectedItem === projectModules.USER_MANAGEMENT} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/${projectModules.INTEGRATIONS}`} onClick={closeSidenav}>
            <SidenavItem name="Integrations" icon="extension" active={props.selectedItem === projectModules.INTEGRATIONS} />
          </Link>
          <Link to={`/mission-control/projects/${projectID}/${projectModules.EXPLORER}`} onClick={closeSidenav}>
            <SidenavItem name="API Explorer" icon="explore" active={props.selectedItem === projectModules.EXPLORER} />
          </Link>
          <Divider />
          <Link to={`/mission-control/projects/${projectID}/${projectModules.SETTINGS}`} onClick={closeSidenav}>
            <SidenavItem name="Settings" icon="settings" active={props.selectedItem === projectModules.SETTINGS} />
          </Link>
        </div>
        <div className="sidenav-version">
          <InfoCircleOutlined style={{ fontSize: "20px", fontWeight: "700" }} />
          <div className="sidenav-version-content">
            <Space direction="vertical" size={4}>
              <Typography.Text>SC Version - v{version}</Typography.Text>
              <Typography.Text>UI Version - v{uiVersion}</Typography.Text>
              <Typography.Text type="secondary">{planName}</Typography.Text>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Sidenav;