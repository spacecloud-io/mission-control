import React, { useState } from 'react'
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import SettingTabs from '../../../components/settings/SettingTabs'
import { useParams } from 'react-router-dom';
import { Card, Button, Table, Popconfirm } from 'antd';
import { useDispatch } from 'react-redux';
import AddClusterForm from '../../../components/settings/AddClusterForm'
import './General.css'
import { get, set, increment, decrement } from 'automate-redux';
import { getProjectConfig, notify, setProjectConfig } from '../../../utils';
import client from "../../../client"
import store from "../../../store";
import history from "../../../history"
import { CopyToClipboard } from 'react-copy-to-clipboard';

function Settings() {
    const { projectID, selectedDB } = useParams()

    const dispatch = useDispatch()

    const [modalVisible, setModalVisibile] = useState(false)
    const [nameCopy, setNameCopy] = useState("copy")
    const [keyCopy, setKeyCopy] = useState("copy")

    const handleModalCancel = () => {
        //setRuleClicked("")
        setModalVisibile(false)
    }

    const copyValue = (e, text) => {
        e.preventDefault();
        if (text === "username") {
            setNameCopy("copied");
            setTimeout(() => setNameCopy("copy"), 5000);
        } else {
            setKeyCopy("copied");
            setTimeout(() => setKeyCopy("copy"), 5000);
        }
    }

    const removeProjectConfig = () => {
        store.dispatch(increment("pendingRequests"))
        client.projects.deleteProject(projectID).then(() => {
            notify("success", "Success", "Removed project config successfully")
            const extraConfig = get(store.getState(), "extraConfig", {})
            const newExtraConfig = delete extraConfig[projectID]
            store.dispatch(set(`extraConfig`, newExtraConfig))
            const projectConfig = store.getState().projects;
            const projectList = projectConfig.filter(project => project.id !== projectID)
            store.dispatch(set(`projects`, projectList))
            history.push(`/mission-control/welcome`)
        })
            .catch(ex => {
                notify("error", "Error removing project config", ex.toString())
            })
            .finally(() => store.dispatch(decrement("pendingRequests")))
    }

    const handleDelete = () => {
        console.log("deleted");
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: text => text,
        },
        {
            title: 'Url',
            dataIndex: 'Url',
            key: 'Url',
        },
        {
            title: 'Actions',
            className: 'column-actions',
            render: (_, record) => {
                return (
                    <span>
                        <Popconfirm title={`This will delete the data. Are you sure?`} onConfirm={handleDelete}>
                            <a style={{ color: "red" }}>Delete</a>
                        </Popconfirm>
                    </span>
                )
            }
        }
    ]

    const data = [
        {
            key: '1',
            name: 'us-east-1',
            Url: 'abc.xyz.com',
        },
        {
            key: '2',
            name: 'us-east-2',
            Url: 'abc.xyz.com',
        },
        {
            key: '3',
            name: 'us-east-3',
            Url: 'abc.xyz.com',
        },
    ];

    return (
        <React.Fragment>
            <div className="settings">
                <Topbar showProjectSelector />
                <div>
                    <Sidenav selectedItem="settings" />
                    <div className='page-content page-content--no-padding'>
                        <SettingTabs activeKey='General' projectID={projectID} />
                        <div className="db-tab-content">
                            <h3>Coming Soon!</h3>
                            {/* <h2>Credentials</h2>
                            <Card style={{ display: "flex", justifyContent: "space-between" }}>
                                <h3 style={{ wordSpacing: 6 }}><b>username </b>  noorainp <CopyToClipboard text="noorainp">
                                    <a onClick={(e) => copyValue(e, "username")}>{nameCopy}</a>
                                </CopyToClipboard></h3>
                                <h3 style={{ wordSpacing: 6 }}><b>Access Key </b>  ************************* <CopyToClipboard text="*************************">
                                    <a onClick={(e) => copyValue(e, "AccessKey")}>{keyCopy}</a>
                                </CopyToClipboard></h3>
                            </Card>
                            <div style={{ paddingTop: 25 }}>
                                <React.Fragment>
                                    <h2 style={{ display: "flex", justifyContent: "space-between" }}>Clusters <Button onClick={() => setModalVisibile(true)} type="primary">Add</Button></h2>
                                    <Table columns={columns} dataSource={data} bordered />
                                </React.Fragment>
                            </div> */}
                        </div>
                    </div>
                    {modalVisible && <AddClusterForm
                        handleCancel={handleModalCancel}
                    />}
                </div>
            </div>
        </React.Fragment>
    )
}

export default Settings