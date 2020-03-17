import React, { useState, useEffect } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { Button, Table, Row, Col, Tooltip, Popconfirm } from "antd"
import { useSelector, useDispatch } from 'react-redux';
import ClusterCard from '../../components/clusters/ClusterCard'
import UpgradeCard from '../../components/clusters/UpgradeCard'
import RegisterCard from '../../components/clusters/RegisterCard'
import AddClusters from '../../components/clusters/AddClusters'
import RegisterCluster from '../../components/clusters/RegisterCluster'
import { useParams } from "react-router-dom";
import client from '../../client'
import store from '../../store';
import { increment, decrement, set, get } from "automate-redux"
import { notify } from '../../utils'

const Clusters = () => {

    const { projectID } = useParams()

    useEffect(() => {
        store.dispatch(increment("pendingRequests"))
        client.clusters.getClusters()
            .then(clusters => {
                store.dispatch(set(`clusters`, clusters))
            })
            .catch(ex => notify("error", "Error fetching clusters", ex.toString()))
            .finally(()=>store.dispatch(decrement("pendingRequests")))
    }, [])

    const clusters = useSelector(state => state.clusters)
    const [addClusterModalVisible, setAddClusterModalVisible] = useState(false)
    const [registerClusterModalVisible, setRegisterClusterModalVisible] = useState(false)
    const columnTableData = clusters.filter(data => data.projects.some(val => val === projectID))
    const disabled = clusters.every(data => data.projects.some(val => val === projectID))
    const filteredArray = clusters.filter(data => data.projects.every(val => val != projectID))

    const registerCluster = (name, username, key, url) => {
        store.dispatch(increment("pendingRequests"))
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
                notify("success", "Success", "Successfully registerd cluster to this project")
                setRegisterClusterModalVisible(false)
            })
            .catch(ex => notify("error", "Error registering cluster", ex.toString()))
            .finally(() => store.dispatch(decrement("pendingRequests")))
    }

    const addCluster = (name) => {
        store.dispatch(increment("pendingRequests"))
        client.clusters.addCluster(projectID, name)
            .then(() => {
                const newList = get(store.getState(), "clusters")
                    .map(data => {
                        if (data.id === name) {
                            data.projects.push(projectID)
                            return data
                        }
                        return data
                    })
                store.dispatch(set("clusters", newList))
                notify("success", "Success", "Successfully added cluster to this project")
                setAddClusterModalVisible(false)
            })
            .catch(ex => notify("error", "Error adding cluster", ex.toString()))
            .finally(() => store.dispatch(decrement("pendingRequests")))
    }

    const removeCluster = (name) => {
        store.dispatch(increment("pendingRequests"))
        client.clusters.removeCluster(projectID, name)
            .then(() => {
                const newList = get(store.getState(), `clusters`)
                    .map(data => {
                        if (data.id === name) {
                            const array = data.projects.filter(id => id !== projectID)
                            return Object.assign({}, data, { projects: array })
                        }
                        return data
                    })
                store.dispatch(set(`clusters`, newList))
                notify("success", "Success", "Successfully removed cluster from this project")
            })
            .catch(ex => notify("error", "Error in removing cluster", ex.toString()))
            .finally(() => store.dispatch(decrement("pendingRequests")))
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
                            title={"This will remove this project from this cluster"}
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
                    <p style={{ margin: "24px 0px 0px 0px", display: "flex", fontSize: 21, justifyContent: "space-between" }}><strong>Project Clusters</strong>
                        <div>
                            {disabled ? (
                                <Tooltip placement="topLeft" title="All clusters are added to this project. Please register a new cluster">
                                    <Button type="primary" disabled={true} onClick={() => setAddClusterModalVisible(true)}>Add</Button>
                                </Tooltip>
                            ) : (<Button type="primary" disabled={false} onClick={() => setAddClusterModalVisible(true)}>Add</Button>)}
                        </div>
                    </p>
                    <p style={{ fontSize: 14, paddingBottom: 20 }}>Clusters on which this project is deployed</p>
                    <div>
                        <Table columns={columns} dataSource={columnTableData} bordered={true} pagination={false} />
                    </div>
                    <div style={{ paddingTop: 40 }}>
                        <h3><b>All Clusters</b></h3>
                        <div style={{ paddingBottom: 20 }}>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    {enterprise ? <RegisterCard handleClick={() => setRegisterClusterModalVisible(true)} /> : <UpgradeCard />}
                                </Col>
                                {clusters.map((data => (
                                    <Col span={8}>
                                        <ClusterCard name={data.id} type={data.type} projects={data.projects} />
                                    </Col>
                                )))}
                            </Row>
                        </div>
                    </div>
                    {addClusterModalVisible && <AddClusters
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