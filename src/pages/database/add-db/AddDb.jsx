import React, { useEffect } from 'react';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import { useParams, useHistory  } from 'react-router-dom';
import { dbEnable } from '../dbActions';
import CreateDatabase from '../../../components/database/create-database/CreateDatabase'
import { Icon, Row, Col, Button } from 'antd';

import '../database.css';

const AddDb = () => {
    const { projectID, selectedDB } = useParams()
    const history = useHistory()

    return(
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
                            <Icon type="left" />
                            Go back
                            </Button>
                            <span style={{ marginLeft: 16 }}>
                                Add Database
                            </span>
                    </div><br />
                    <div>
                    <Row>
                        <Col lg={{ span: 18, offset: 3 }} sm={{ span: 24 }} >
                            <CreateDatabase projectId={projectID} handleSubmit={() => history.push(`/mission-control/projects/${projectID}/database`)} />
                        </Col>
                    </Row>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default AddDb;
