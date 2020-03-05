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
import client from '../../client'
import store from '../../store';
import { increment, decrement, set, get } from "automate-redux"

const Clusters = () => {

    const { projectID } = useParams()

    useEffect(() => {
        client.clusters.getClusters()
            .then(clusters => {
                store.dispatch(set(`clusters`, clusters))
            })
            .catch(err => console.log(err))
    }, [])

    const clusters = useSelector(state => state.clusters)
    const [addClusterModalVisible, setAddClusterModalVisible] = useState(false)
    const [registerClusterModalVisible, setRegisterClusterModalVisible] = useState(false)
    const columnTableData = clusters.filter(data => data.projects.some(val => val === projectID))
    const disabled = clusters.every(data => data.projects.some(val => val === projectID))
    const filteredArray = clusters.filter(data => data.projects.every(val => val != projectID))

    const registerCluster = (name, username, key, url) => {
        client.clusters.registerCluster(name, username, key, url)
            .then(clusterType => {
                const newCluster = {
                    id: name,
                    type: clusterType,
                    url,
                    projects: []
                }
                const updatedCluster = [...store.getState().clusters, newCluster]
                store.dispatch(set("clusters", updatedCluster))
            })
            .catch(err => console.log(err))
            .finally(() => setRegisterClusterModalVisible(false))
    }

    const addCluster = (name) => {
        client.clusters.addCluster(projectID, name)
            .then(() => {
                const newList = get(store.getState(), "clusters")
                    .map(data => {
                        if (data.id === name) {
                            data.projects.push(`${projectID}`)
                            return data
                        } else {
                            return data
                        }
                    })
                store.dispatch(set("clusters", newList))
            })
            .catch(err => console.log(err))
            .finally(() => setAddClusterModalVisible(false))
    }

    const removeCluster = (name) => {
        client.clusters.removeCluster(projectID, name)
            .then(() => {
                const newList = get(store.getState(), `clusters`)
                    .map(data => {
                        if (data.id === name) {
                            const array = data.projects.filter(id => id !== projectID)
                            return Object.assign({}, data, { projects: array })
                        } else {
                            return data
                        }
                    })
                store.dispatch(set(`clusters`, newList))
            })
            .catch(err => console.log(err))
    }

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
                            onConfirm={() => removeCluster(record.id)}
                        >
                            <a style={{ color: "red" }}>Remove</a>
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
                <Sidenav selectedItem='clusters' />
                <div className="page-content">
                    <p style={{ margin: "24px 0px 0px 0px", display: "flex", fontSize: 21, justifyContent: "space-between" }}><p style={{ margin: "0px 0px 0px 0px" }}><strong>Selected Clusters</strong>{" (of this project)"}</p>
                        <div>
                            {disabled ? (
                                <Tooltip placement="topLeft" title="All cluster are added and no cluster to add">
                                    <Button type="primary" disabled={true} onClick={() => setAddClusterModalVisible(true)}>Add</Button>
                                </Tooltip>
                            ) : (<Button type="primary" disabled={false} onClick={() => setAddClusterModalVisible(true)}>Add</Button>)}
                        </div>
                    </p>
                    <p style={{ fontSize: 14, paddingBottom: 20 }}>Choose clusters to deploy this project environment on</p>
                    <div>
                        <Table columns={columns} dataSource={columnTableData} bordered={true} pagination={false} />
                    </div>
                    <div style={{ paddingTop: 40 }}>
                        <h3><b>All Clusters</b></h3>
                        <div style={{ paddingBottom: 20 }}>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    {enterprise ? <RegisterCard popup={setRegisterClusterModalVisible} /> : <UpgradeCard />}
                                </Col>
                                {clusters.map((data => (
                                    <Col span={8}>
                                        <ClusterCard name={data.id} type={data.type} projects={data.projects} />
                                    </Col>
                                )))}
                            </Row>
                        </div>
                    </div>
                    {addClusterModalVisible && <AddCluster
                        handleSubmit={addCluster}
                        handleCancel={() => setAddClusterModalVisible(false)}
                        clusters={filteredArray}
                    />}
                    {registerClusterModalVisible && <RegisterCluster
                        handleSubmit={registerCluster}
                        handleCancel={() => setRegisterClusterModalVisible(false)} />}
                </div>
            </div>
        </div>
    )
}

export default Clusters