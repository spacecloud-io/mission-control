import React, { useState, useEffect } from 'react'
import { useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import { set, increment, decrement } from "automate-redux"
import client from '../../client';
import store from "../../store"
import history from "../../history"
import { generateProjectConfig, notify } from '../../utils';

import { Row, Col, Button, Form, Input, Icon } from 'antd'
import StarterTemplate from '../../components/starter-template/StarterTemplate'
import Topbar from '../../components/topbar/Topbar'
import './create-project.css'

import create from '../../assets/create.svg'
import postgresIcon from '../../assets/postgresIcon.svg'
import mysqlIcon from '../../assets/mysqlIcon.svg'
import mongoIcon from '../../assets/mongoIcon.svg'

const CreateProject = (props) => {
  const [selectedDB, setSelectedDB] = useState("mongo")
  const dispatch = useDispatch()

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])


  const { getFieldDecorator, validateFields, getFieldValue } = props.form;

  const projectName = getFieldValue("projectName");
  const projectID = projectName ? projectName.toLowerCase().replace(/\s+|-/g, '_') : "";

  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const projectConfig = generateProjectConfig(projectID, values.projectName, selectedDB)
        dispatch(increment("pendingRequests"))
        client.projects.addProject(projectConfig).then(() => {
          const updatedProjects = [...store.getState().projects, projectConfig]
          dispatch(set("projects", updatedProjects))
          history.push(`/mission-control/projects/${projectID}`)
          notify("success", "Success", "Project created successfully with suitable defaults")
        }).catch(ex => notify("error", "Error creating project", ex))
        .finally(() => dispatch(decrement("pendingRequests")))
      }
    });
  };

  return (
    <div className="create-project">
      <Topbar hideActions />
      <div className="content">
        <Row>
          <Col lg={{ span: 20, offset: 2 }} sm={{ span: 24 }}>
            <p>Project name</p>
            <Form>
              <Form.Item >
                {getFieldDecorator('projectName', {
                  rules: [{ required: true, message: 'Please input a project name' }],
                })(
                  <Input
                    prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Project name" className="project-name" />,
                )}
                <br/>
                {projectID && <span className="hint">ProjectID: {projectID}</span>}
              </Form.Item>
            </Form>
            <p>Choose a primary database</p>
            <div className="underline"></div>
            <div className="cards">
              <Row>
                <Col span={{ xs: 24, sm: 24, md: 6, lg: 6 }} >
                  <StarterTemplate icon={mongoIcon} onClick={() => setSelectedDB("mongo")}
                    heading="MONGODB" desc="A open-source cross-platform document- oriented database."
                    recommended={false}
                    active={selectedDB === "mongo"} />
                </Col>

                <Col span={{ xs: 24, sm: 24, md: 6, lg: 6 }}>
                  <StarterTemplate icon={postgresIcon} onClick={() => setSelectedDB("sql-postgres")}
                    heading="POSTGRESQL" desc="The world's most advanced open source database."
                    recommended={false}
                    active={selectedDB === "sql-postgres"} />
                </Col>

                <Col span={{ xs: 24, sm: 24, md: 6, lg: 6 }}>
                  <StarterTemplate icon={mysqlIcon} onClick={() => setSelectedDB("sql-mysql")}
                    heading="MYSQL" desc="The world's most popular open source database."
                    recommended={false}
                    active={selectedDB === "sql-mysql"} />
                </Col>
              </Row>

            </div>
            <img className="image" src={create} alt="graphic" height="380" width="360" />
            <Button type="primary" htmlType="submit" className="next-btn" onClick={handleSubmit}>NEXT</Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}
const WrappedCreateProject = Form.create({})(CreateProject)

export default WrappedCreateProject;
