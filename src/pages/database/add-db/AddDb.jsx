import React, { useEffect } from 'react';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import { useParams, useHistory } from 'react-router-dom';
import { addDatabase } from '../../../operations/database';
import CreateDatabase from '../../../components/database/create-database/CreateDatabase'
import { LeftOutlined } from '@ant-design/icons';
import { Row, Col, Button } from 'antd';
import ReactGA from 'react-ga'
import '../database.css';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../../utils';
import { projectModules, actionQueuedMessage } from '../../../constants';

const AddDb = () => {
  const { projectID } = useParams()
  const history = useHistory()

  useEffect(() => {
    ReactGA.pageview("/projects/database/add-db");
  }, [])

  const addDb = (alias, connectionString, dbType, dbName) => {
    incrementPendingRequests()
    addDatabase(projectID, alias, dbType, dbName, connectionString)
      .then(({ queued, enabledEventing }) => {
        if (!queued) {
          history.push(`/mission-control/projects/${projectID}/database/${alias}/overview`)
          notify("success", "Success", "Successfully added database")
          if (enabledEventing) {
            notify("info", "Enabled eventing module", "Configured this database to store event logs. Check out the settings in eventing section to change it")
          }
        } else {
          notify("success", "Success", actionQueuedMessage)
        }
      })
      .catch(ex => notify("error", "Error adding database", ex))
      .finally(() => decrementPendingRequests())
  }

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
      />
      <div>
        <Sidenav selectedItem={projectModules.DATABASE} />
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
