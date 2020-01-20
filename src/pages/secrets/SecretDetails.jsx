import React, {useState} from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { Button, Table, Icon, Row, Col, Popconfirm, Card } from 'antd';
import AddSecret from '../../components/secret/AddSecret';
import { getSecretType } from '../../utils';
import { useHistory, useParams} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getProjectConfig} from "../../utils"
import store from '../../store';


const SecretDetails = () => {
    const history = useHistory();
    const {projectID, secretName} = useParams();
	const [EachAddModalVisible, setEachAddModalVisible] = useState(false);
	const dispatch = useDispatch();
	//const [secretname, setSecretName] = useState("");
	//const [secretType, setSecretType] = useState("Environment Variables");
	const [secretUpdate, setSecretUpdate] = useState("")
	const [secretUpdateModal, setSecretUpdateModal] = useState(false)
	const secrets = [];
	const secretUpdateInfo = secretUpdate ? { name: secretUpdate, ...secrets[secretUpdate] } : undefined

	const type = store.getState().secretType
	const secretType = getSecretType(type)
	
    const handleUpdateEnvVar = (name) => {
		setSecretUpdateModal(true)
		setSecretUpdate(name);
    }
    
    const handleDeleteSecret = (name) => {
		
    }
    
    const envVarTableData = [
		{
			name: "Mongo_port",
		},
		{
			name: "mongo_url",
		},
		{
			name: "mongo_db_name",
		}
	]
	const envColumns = [
		{
			title: 'Name',
			dataIndex: 'name'
		},
		{
			title: 'Actions',
			className: 'column-actions',
			render: (_, record) => {
				//const source = getEventSourceFromType(record.type)
				return (
					<span>
						<a onClick={() => handleUpdateEnvVar(record.name)}>Update</a>
						<Popconfirm title={`This will delete the secret. Are you sure?`} onConfirm={handleDeleteSecret}>
                            <a style={{ color: "red" }}>Delete</a>
                        </Popconfirm>	
					</span>
				)
			}
		}
	]

	const fileTableData = [
		{
			location: "/home/.aws/credentials",
		},
		{
			location: "/home/.aws/credentials",
		},
		{
			location: "/home/.aws/credentials",
		}
	]

	const fileColumns = [
		{
			title: 'Location',
			dataIndex: 'location'
		},
		{
			title: 'Actions',
			className: 'column-actions',
			render: (_, record) => {
				return (
					<span>
						<a onClick={() => handleUpdateEnvVar(record.name)}>Update</a>
                        <Popconfirm title={`This will delete the secret. Are you sure?`} onConfirm={handleDeleteSecret}>
                            <a style={{ color: "red" }}>Delete</a>
                        </Popconfirm>	
					</span>
				)
			}
		}
	]
	const dockerTableData = [
		{
			username: "noorainp",
			registry_url: "https://spaceuptech.com/my-private-registry"
		}
	]

	const dockerColumns = [
		{
			title: 'Username',
			dataIndex: 'username'
		},
		{
			title: 'Registry URL',
			dataIndex: 'registry_url'
		}
	]

    return(
        <div>
            <Topbar showProjectSelector />
			<Sidenav selectedItem="secrets" />
			<div>
            {EachAddModalVisible && <AddSecret eachAdd={true} update={false} type={secretType}
            handleCancel={() => setEachAddModalVisible(false)} />}
            {secretUpdateModal && <AddSecret eachAdd={true} update={true} type={secretType}
            handleCancel={() => setSecretUpdateModal(false)} initialValues={secretUpdateInfo}/>}
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
                <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/secrets`)}>
                    <Icon type="left" />
                    Go back
                    </Button>
                <span style={{ marginLeft: 460 }}>
                    {secretName}
                    </span>
                </div><br />
                <Row>
                    <Col lg={{span: 15, offset: 1}}>
                        <h3 style={{ display: "flex", justifyContent: "space-between" }}>{secretType} 
                        {secretType !== "Docker Secret" && <Button onClick={() => setEachAddModalVisible(true)} type="primary">Add</Button>}</h3>
                        {secretType === "Environment Variables" && 
                        <Table columns={envColumns} dataSource={envVarTableData} bordered={true} pagination={false} />}
                        {secretType === 'File Secret' && 
                        <Table columns={fileColumns} dataSource={fileTableData} bordered={true} pagination={false}/>}
                        {secretType === 'Docker Secret' && 
						<Card style={{width: "145%"}}>
							<p><span style={{fontWeight: "bold", fontSize: 14}}>Username</span> <span style={{marginLeft: 48, fontSize: 14}}>noorainp</span></p>
							<p><span style={{fontWeight: "bold", fontSize: 14}}>Registry URL</span> <span style={{marginLeft: 30, fontSize: 14}}>https://spaceuptech.com/my-private-registry</span></p>
						</Card>}
					</Col>
                </Row>
                </div>
            </div>
        </div>
    );
}

export default SecretDetails;

