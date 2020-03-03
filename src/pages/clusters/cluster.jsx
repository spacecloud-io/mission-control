import React, { useState, useEffect } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { Button, Table, Row, Col, Tooltip, Popconfirm } from "antd"
import { useSelector, useDispatch } from 'react-redux';
import ClusterCard from '../../components/clusters/ClusterCard'
import UpgradeCard from '../../components/clusters/UpgradeCard'
import RegisterCard from '../../components/clusters/RegisterCard'
import AddCluster from '../../components/clusters/AddClusters'
import RegisterCluster from '../../components/clusters/RegisterCluster'
import { useParams } from "react-router-dom";

const Cluster = () => {

    const { projectID } = useParams()
    const clusters = useSelector(state => state.clusters)
    const [addClusterModalVisible, setAddClusterModalVisible] = useState(false)
    const [addRegisterClusterModalVisible, setAddRegisterClusterModalVisible] = useState(false)
    const columnTableData = clusters.filter(data => data.project.some(val => val === projectID))
    const disabled = clusters.every(data => data.project.some(val => val === projectID))
    const filteredArray = clusters.filter(data => data.project.every(val => val != projectID))

    const columns = [
        {
            title: <b>Name</b>,
            dataIndex: 'id',
        },
        {
            title: <b>Url</b>,
            dataIndex: 'url',
        },
        {
            title: <b> Action</b>,
            dataIndex: 'action',
            render: (_, record) => {
                return (
                    <span>
                        <Popconfirm
                            title={`This will remove the cluster. Are you sure?`}
                            onConfirm={() => console.log("removed")}
                        >
                            <a style={{ color: "red" }}>remove</a>
                        </Popconfirm>
                    </span>
                )
            }
        },
    ];

    const enterprise = 1;
    return (
        <div>
            <Topbar showProjectSelector />
            <div>
                <Sidenav selectedItem='cluster' />
                <div className="page-content">
                    <h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}><b>Selected Clusters (of this project)</b>
                        {disabled ? (
                            <Tooltip placement="topLeft" title="All cluster are added and no cluster to add">
                                <Button type="primary" disabled={true} onClick={() => setAddClusterModalVisible(true)}>Add</Button>
                            </Tooltip>
                        ) : (<Button type="primary" disabled={false} onClick={() => setAddClusterModalVisible(true)}>Add</Button>)}
                    </h3>
                    <h5>Choose clusters to deploy this project environment on</h5>
                    <div>
                        <Table columns={columns} dataSource={columnTableData} bordered={true} />
                    </div>
                    <div>
                        <h3><b>All Clusters</b></h3>
                        <div style={{ paddingBottom: 20 }}>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    {enterprise ? <RegisterCard popup={setAddRegisterClusterModalVisible} /> : <UpgradeCard />}
                                </Col>
                                {columnTableData.map((data => (
                                    <Col span={8}>
                                        <ClusterCard name={data.id} type={data.type} projects={data.project} />
                                    </Col>
                                )))}
                            </Row>
                        </div>
                    </div>
                    {addClusterModalVisible && <AddCluster
                        // handleSubmit
                        handleCancel={() => setAddClusterModalVisible(false)}
                        data={filteredArray}
                    />}
                    {addRegisterClusterModalVisible && <RegisterCluster
                        // handleSubmit
                        handleCancel={() => setAddRegisterClusterModalVisible(false)} />}
                </div>
            </div>
        </div>
    )
}

export default Cluster