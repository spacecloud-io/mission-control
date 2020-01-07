import React, { useState } from 'react';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import { Button, Table, Popconfirm, Icon, Descriptions } from "antd"
import { useParams, useHistory } from "react-router-dom"

const DetailsTopBar = ({ projectID, serviceName }) => {

    const history = useHistory()

    return <div style={{
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
        height: 48,
        lineHeight: 48,
        zIndex: 98,
        display: "flex",
        alignItems: "center",
        padding: "0 16px"
    }}>
        <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/manage-services`)}>
            <Icon type="left" />
            Go back
        </Button>
        <span style={{ marginLeft: 16, paddingLeft: 500 }}>
            <b>{serviceName}</b>
        </span>
    </div>
}

const DatabaseDetails = () => {
    const { projectID, serviceName } = useParams()
    return (
        <React.Fragment>
            <Topbar />
            <Sidenav selectedItem='manage-services' />
            <div className='page-content page-content--no-padding'>
                <DetailsTopBar projectID={projectID} serviceName={serviceName} />
                <div className="db-tab-content">
                    <h3>Connection Details</h3>
                    <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Host">http://localhost:3000</Descriptions.Item>
                        <Descriptions.Item label="Port">3306</Descriptions.Item>
                        <Descriptions.Item label="Username" span={2}>
                            root-user
                        </Descriptions.Item>
                        <Descriptions.Item label="Password" span={2}>
                            password
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </div>
        </React.Fragment>
    )
}

export default DatabaseDetails;