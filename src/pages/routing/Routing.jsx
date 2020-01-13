import React, { useState } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { useParams } from "react-router-dom";
import routingSvg from "../../assets/routing.svg"
import { Button, Table, Divider, Popconfirm } from "antd"
import RoutingRule from "../../components/routing/routingRule"

function Routing() {

    const [modalVisible, setModalVisible] = useState(false);

    const handleDelete = () => {
        console.log("deleted")
    }

    const columns = [
        {
            title: <b>{'AllowedHosts'}</b>,
            dataIndex: 'AllowedHosts',
            key: 'Allowed Hosts',
            render: text => text,
        },
        {
            title: <b>{'RequestURL'}</b>,
            dataIndex: 'RequestURL',
            key: 'Request URL',
        },
        {
            title: <b>{'target'}</b>,
            dataIndex: 'target',
            key: 'target',
        },
        {
            title: <b>{'Actions'}</b>,
            className: 'actions',
            render: () => {
                return (
                    <span>
                        <a style={{ color: "blue" }}>Edit</a>
                        <Popconfirm title={`This will delete all the data. Are you sure?`} onConfirm={handleDelete}>
                            <a style={{ color: "red", paddingLeft: 10 }}>Delete</a>
                        </Popconfirm>
                    </span>
                )
            }
        }

    ]

    const data = [
        {
            key: '1',
            AllowedHosts: 'All',
            RequestURL: 'v1/',
            target: 'service/v1/*',
        },
        {
            key: '2',
            AllowedHosts: 'SpaceUpTech.com',
            RequestURL: 'v1/',
            target: 'service2/v1/*',
        },
    ]

    const len = data.length;

    return (
        <div>
            <Topbar showProjectSelector />
            <div>
                <Sidenav selectedItem="routing" />
                <div className="page-content">
                    {len === 0 &&
                        <div className="panel">
                            <img src={routingSvg} style={{ height: 300 }} />
                            <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>No routes created yet. Create a routing rule to expose your deployments to the outer world.</p>
                            <Button type="primary" style={{ marginTop: 16 }} onClick={() => setModalVisible(true)}>
                                Create your first route
						</Button>
                        </div>
                    }
                    {len > 0 && <React.Fragment>
                        <h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>Routing rules <Button type="primary" onClick={() => setModalVisible(true)}>Add</Button></h3>
                        <Table columns={columns} dataSource={data} bordered />
                    </React.Fragment>}
                </div>
                {modalVisible && <RoutingRule
                    //handleSubmit={handleAddRule}
                    handleCancel={() => setModalVisible(false)} />}
            </div>
        </div>
    )
}

export default Routing