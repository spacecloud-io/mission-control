import React, { useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import security from '../../assets/security.svg';
import { Button, Table, Icon, Row, Col } from 'antd';
import AddSecret from '../../components/secret/AddSecret';
import { getSecretType } from '../../utils';

const Secrets = () => {
	const [secretModalVisible, setSecretModalVisible] = useState(false);
	const [EachAddModalVisible, setEachAddModalVisible] = useState(false);
	const [secret, setSecret] = useState(true);
	const [secretName, setSecretName] = useState("");
	const [secretType, setSecretType] = useState("");
	const [secretUpdate, setSecretUpdate] = useState("")
	const [secretUpdateModal, setSecretUpdateModal] = useState(false)
	const secrets = [];
	const secretUpdateInfo = secretUpdate ? { name: secretUpdate, ...secrets[secretUpdate] } : undefined

	const handleViewSecretClick = () => {
		
	
	}

	const handleUpdateEnvVar = (name) => {
		setSecretUpdateModal(true)
		setSecretUpdate(name);
	}

	const handleDeleteSecret = (name) => {
		setSecretName(name)
	}

	const secretsTableData = [
		{
			name: "my secret",
			type: "env var"
		},
		{
			name: "docker credentials",
			type: "docker secret"
		},
		{
			name: "AWS S3 credentials",
			type: "file secret"
		},
		{
			name: "custom data",
			type: "env var"
		}
	]
	const columns = [
		{
			title: 'Name',
			dataIndex: 'name'
		},
		{
			title: 'Type',
			key: 'type',
			render: (_, record) => getSecretType(record.type)
		},
		{
			title: 'Actions',
			className: 'column-actions',
			render: (_, record) => {
				//const source = getEventSourceFromType(record.type)
				return (
					<span>
						<a onClick={() => {
							setSecretName(record.name) 
							setSecretType(getSecretType(record.type))
							setSecret(false)}}>View</a>
						<a style={{ color: "red" }} onClick={() => handleDeleteSecret(record.name)}>Delete</a>
					</span>
				)
			}
		}
	]

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
						<a style={{ color: "red" }} onClick={() => handleDeleteSecret(record.name)}>Delete</a>
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
				//const source = getEventSourceFromType(record.type)
				return (
					<span>
						<a onClick={() => handleUpdateEnvVar(record.name)}>Update</a>
						<a style={{ color: "red" }} onClick={() => handleDeleteSecret(record.name)}>Delete</a>
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

	const EmptyState = () => {
		return <div style={{ marginTop: 24 }}>
			<div className="panel">
				<img src={security} />
				<p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>
				Store private information required by your deployments in a secure, encrypted format. 
				Space Cloud takes care of all encryption and decryption.</p>
				<Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setSecretModalVisible(true)}>Add your first secret</Button>
			</div>
		</div>
	}

	const handleSecretModalCancel = () => {
		setSecretModalVisible(false)
	}

  return (
    <div>
			<Topbar showProjectSelector />
			<div>
				<Sidenav selectedItem="secrets" />
				<div className="page-content">
					{secret && <React.Fragment>
						<h3 style={{ display: "flex", justifyContent: "space-between" }}>Secrets <Button onClick={() => setSecretModalVisible(true)} type="primary">Add</Button></h3>
						<Table columns={columns} dataSource={secretsTableData} bordered={true} />
					</React.Fragment>}
					{secretModalVisible && <AddSecret eachAdd={false}
					handleCancel={handleSecretModalCancel} initialValues={secretUpdateInfo}/>}
					{EachAddModalVisible && <AddSecret eachAdd={true} update={false} type={secretType}
					handleCancel={() => setEachAddModalVisible(false)} />}
					{secretUpdateModal && <AddSecret eachAdd={true} update={true} type={secretType}
					handleCancel={() => setSecretUpdateModal(false)} initialValues={secretUpdateInfo}/>}
					{secretName && !secret && <React.Fragment>
						<div className='page-content--no-padding'>
                    <div style={{
                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
                        height: 48,
                        lineHeight: 48,
                        zIndex: 98,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 16px"
                    }}>
						<Button type="link" onClick={() => {
							setSecret(true)
							}}>
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
								<Table columns={envColumns} dataSource={envVarTableData} bordered={true} />}
								{secretType === 'File Secret' && 
								<Table columns={fileColumns} dataSource={fileTableData} bordered={true} />}
								{secretType === 'Docker Secret' && 
								<Table columns={dockerColumns} dataSource={dockerTableData} bordered={true} />}
							</Col>
						</Row>
						</div>
					</React.Fragment>}
				</div>
			</div>
		</div>
  );
}

export default Secrets;