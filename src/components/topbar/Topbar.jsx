import React, { useState } from 'react'
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from 'react-redux';
import { dbIcons, openBillingPortal } from '../../utils'
import { CaretDownOutlined, MenuOutlined, PoweroffOutlined } from '@ant-design/icons';
import { Button, Menu, Popover, Row, Col, Tooltip } from 'antd';
import DbSelector from '../../components/db-selector/DbSelector'
import SelectProject from '../../components/select-project/SelectProject'
import './topbar.css'
import store from "../../store"
import { set } from "automate-redux"
import githubIcon from "../../assets/githubIcon.svg"
import heartIcon from "../../assets/heartIcon.svg"
import githubOctocat from "../../assets/githubOctocat.svg"
import twitterIcon from "../../assets/twitterIcon.svg"
import logo from '../../assets/logo-black.svg';
import upLogo from '../../logo.png';
import crownSvg from "../../assets/crown.svg";
import { isClusterUpgraded, isProdMode } from '../../operations/cluster';
import { redirectToLogin, setLastUsedValues } from '../../utils';

const Topbar = (props) => {
  const history = useHistory()
  const { projectID, selectedDB } = useParams()
  const [modalVisible, setModalVisible] = useState(false)
  const [visible, setVisible] = useState(false)
  const state = useSelector(state => state)
  const projects = useSelector(state => state.projects)
  const clusterUpgraded = useSelector(state => isClusterUpgraded(state))
  const selectedProject = projects.find(project => project.id === projectID)
  const projectName = selectedProject ? selectedProject.name : ""
  const handleDBSelect = (dbName) => {
    setLastUsedValues(projectID, { db: dbName });
    history.push(`/mission-control/projects/${projectID}/database/${dbName}`)
  }
  const svgIcon = dbIcons(selectedDB)
  const content = (
    <div className="popContent">
      <p style={{ marginBottom: "50px", fontWeight: "bold", fontSize: "16px" }}>Love Space Cloud? Help us spread the love!</p>
      <Row align="middle">
        <Col md={{ span: 12, offset: 0 }} >
          <a href="https://github.com/spaceuptech/space-cloud" target="_blank">
            <img src={githubOctocat} />
            <p style={{ marginTop: "20px", color: "rgba(0, 0, 0, 0.65)", fontWeight: "600", fontSize: "14px" }}>Star</p>
          </a>
        </Col>
        <Col md={{ span: 12, offset: 0 }}>
          <a href=" https://twitter.com/intent/tweet?text=Just%20deployed%20%23SpaceCloud%20-%20an%20opensource%20Firebase%20%2B%20Heroku!%20by%20%40SpaceUpTech.%0Ahttps%3A//github.com/spaceuptech/space-cloud%0A%23graphql%20%23webdev"
            target="_blank">
            <img src={twitterIcon} />
            <p style={{ marginTop: "20px", color: "rgba(0, 0, 0, 0.65)", fontWeight: "600", fontSize: "14px" }}>Tweet</p>
          </a>
        </Col>
      </Row>
    </div>
  );

  const onLogoutIconClick = () => {
    localStorage.removeItem('token');
    redirectToLogin();
  }
  return (
    <div>
      <div className="topbar">
        <MenuOutlined
          className="hamburger"
          onClick={() => store.dispatch(set("uiState.showSidenav", true))} />
        <img className="logo" src={logo} alt="logo" />
        <img className="upLogo" src={upLogo} alt="logo" />
        {props.showProjectSelector && <div className="btn-position">
          <Button className="action-rounded" onClick={() => setModalVisible(true)}>{projectName}
            <CaretDownOutlined />
          </Button>
        </div>}
        {props.showDbSelector && <div className="db-btn-position">
          <Button className="action-rounded" onClick={() => setVisible(true)}>
            <img src={svgIcon} alt={selectedDB} style={{ marginRight: 10 }} />
            {selectedDB}
            <CaretDownOutlined />
          </Button>
        </div>}
        <DbSelector visible={visible} handleSelect={handleDBSelect} handleCancel={() => setVisible(false)} />
        <SelectProject visible={modalVisible} handleCancel={() => setModalVisible(false)} />
        <div className="right-list">
          <Menu mode="horizontal">
            <Menu.Item>
              <a href="https://docs.spaceuptech.com/" target="_blank">Docs</a>
            </Menu.Item>
            <Menu.Item>
              <a href="https://learn.spaceuptech.com/" target="_blank">Learn</a>
            </Menu.Item>
            <Menu.Item>
              <a href="https://github.com/spaceuptech/space-cloud" target="_blank">
                <img src={githubIcon} />
              </a>
            </Menu.Item>
            <Menu.Item>
              <Popover content={content} trigger="click" placement="bottomRight" overlayStyle={{ textAlign: "center" }}>
                <img src={heartIcon} />
              </Popover>
            </Menu.Item>
            {!clusterUpgraded && <Menu.Item>
              <Button type="primary" ghost onClick={openBillingPortal}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>Upgrade</span>
                  <img style={{ marginLeft: 8 }} src={crownSvg} alt="Crown" />
                </div>
              </Button>
            </Menu.Item>}
            {isProdMode(state) && (
              <Menu.Item>
                <Tooltip title="Logout">
                  <PoweroffOutlined style={{ fontSize: 24, verticalAlign: 'middle', color: 'rgba(0, 0, 0, 0.54)' }} onClick={onLogoutIconClick} />
                </Tooltip>
              </Menu.Item>
            )}
          </Menu>
        </div>
      </div>
    </div>
  );
}

export default Topbar;