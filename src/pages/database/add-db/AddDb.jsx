import React, { useEffect } from 'react';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import { useParams, useHistory } from 'react-router-dom';
import { dbEnable } from '../dbActions';
import CreateDatabase from '../../../components/database/create-database/CreateDatabase'
import { LeftOutlined } from '@ant-design/icons';
import { Row, Col, Button } from 'antd';
import ReactGA from 'react-ga'
import { useSelector, useDispatch } from 'react-redux';
import '../database.css';
import { notify } from '../../../utils';
import { decrement, increment } from 'automate-redux';

const AddDb = () => {
  const { projectID } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()
  const projects = useSelector(state => state.projects)

  useEffect(() => {
    ReactGA.pageview("/projects/database/add-db");
  }, [])

  const addDb = (alias, connectionString, defaultDBRules, dbType, dbName) => {
    dispatch(increment("pendingRequests"))
    dbEnable(projects, projectID, alias, dbType, dbName, connectionString, defaultDBRules)
    .then(() => {
      history.push(`/mission-control/projects/${projectID}/database/${alias}/overview`)
      notify("success", "Success", "Successfully added database")
    })
    .catch(ex => notify("error", "Error adding database", ex))
    .finally(() => dispatch(decrement("pendingRequests")))
  }

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
      />
      <div>
        <Sidenav selectedItem='database' />
        <div className='page-content page-content--no-padding'>
          <div style={{
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
            height: 48,
            lineHeight: 48,
            zIndex: 98,
            display: "flex",
            alignItems: "center",
            padding: "0 16px"
          }}>
            <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/database`)}>
              <LeftOutlined />
                            Go back
                            </Button>
            <span style={{ marginLeft: 16 }}>
              Add Database
                            </span>
          </div><br />
          <div>
            <Row>
              <Col lg={{ span: 18, offset: 3 }} sm={{ span: 24 }} >
                <CreateDatabase projectId={projectID} handleSubmit={addDb} />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default AddDb;
