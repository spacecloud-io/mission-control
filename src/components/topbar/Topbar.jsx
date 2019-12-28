import React, { useState } from 'react'
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from 'react-redux';
import { dbIcons } from '../../utils'
import { Button, Icon, Select } from 'antd';
import DbSelector from '../../components/db-selector/DbSelector'
import SelectProject from '../../components/select-project/SelectProject'
import './topbar.css'
import store from "../../store"
import { set, get } from "automate-redux"

import logo from '../../assets/logo-black.svg';
import upLogo from '../../logo.png'
import { dbTypes } from '../../constants';

const Topbar = (props) => {
  const history = useHistory()
  const { projectID, selectedDB } = useParams()
  const [modalVisible, setModalVisible] = useState(false)
  const [visible, setVisible] = useState(false)
  const projects = useSelector(state => state.projects)
  const selectedProject = projects.find(project => project.id === projectID)
  const projectName = selectedProject ? selectedProject.name : ""
  const handleDBSelect = (dbName) => history.push(`/mission-control/projects/${projectID}/database/${dbName}`)
  
  const svgIcon = dbIcons(projects, projectID, selectedDB)
  return (
    <div>
      <div className="topbar">
        <Icon type="menu" className="hamburger" onClick={()=>store.dispatch(set("uiState.showSidenav", true))}/>
        <img className="logo" src={logo} alt="logo" />
        <img className="upLogo" src={upLogo} alt="logo" />
        {props.showProjectSelector && <div className="btn-position">
          <Button className="action-rounded" onClick={() => setModalVisible(true)}>{projectName}
            <Icon type="caret-down" />
          </Button>
        </div>}
        {props.showDbSelector && <div className="db-btn-position">
          <Button className="action-rounded" onClick={() => setVisible(true)}>
            <img src={svgIcon} alt={selectedDB} style={{ marginRight: 10 }} />
            {selectedDB}
            <Icon type="caret-down" />
          </Button>
        </div>}
        <DbSelector visible={visible} handleSelect={handleDBSelect} handleCancel={() => setVisible(false)} />

        <SelectProject visible={modalVisible} handleCancel={() => setModalVisible(false)} />
      </div>
    </div>
  )
}

export default Topbar;