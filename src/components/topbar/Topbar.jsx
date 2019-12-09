import React, { useState } from 'react'
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from 'react-redux';
import { getProjectConfig } from '../../utils'
import { Button, Icon, Select } from 'antd';
import DbSelector from '../../components/db-selector/DbSelector'
import SelectProject from '../../components/select-project/SelectProject'
import './topbar.css'

import logo from '../../assets/logo-black.svg';
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
  const crudModule = getProjectConfig(projects, projectID, "modules.crud", {})
  let checkDB = ''
  if (crudModule[selectedDB]) checkDB = crudModule[selectedDB].type

  const mysqlSvg = require(`../../assets/mysqlSmall.svg`)
const postgresSvg = require(`../../assets/postgresSmall.svg`)
const mongoSvg = require(`../../assets/mongoSmall.svg`)

  var svg = mongoSvg
  switch (checkDB) {
    case dbTypes.MONGO:
      svg = mongoSvg
      break;
    case dbTypes.MYSQL:
      svg = mysqlSvg
      break;
    case dbTypes.POSTGRESQL:
      svg = postgresSvg
      break;
    default:
      svg = postgresSvg
  }
  
  return (
    <div>
      <div className="topbar">
        <img src={logo} alt="logo" />
        {props.showProjectSelector && <div className="btn-position">
          <Button className="action-rounded" onClick={() => setModalVisible(true)}>{projectName}
            <Icon type="caret-down" />
          </Button>
        </div>}
        {props.showDbSelector && <div className="db-btn-position">
          <Button className="action-rounded" onClick={() => setVisible(true)}>
            <img src={svg} style={{ marginRight: 10 }} alt={checkDB} />
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