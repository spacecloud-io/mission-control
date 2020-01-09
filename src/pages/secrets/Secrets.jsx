import React, { useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import security from '../../assets/security.svg';
import { Button, Table } from 'antd';
import AddSecret from '../../components/secret/AddSecret';
import { getSecretType } from '../../utils'

const Secrets = () => {
	const [secretModalVisible, setSecretModalVisibile] = useState(false)
	const [secretClicked, setSecretClicked] = useState("")

	const handleEditSecretClick = (name) => {
		setSecretClicked(name)
		setSecretModalVisibile(true)
	}

	const handleDeleteSecret = (name) => {
		setSecretClicked(name)
	}

	const secretsTableData = [
		{
			name: "my secret",
			type: "environment variable"
		},
		{
			name: "docker secret",
			type: "docker secret"
		},
		{
			name: "file secret",
			type: "file secret"
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
						<a onClick={() => handleEditSecretClick(record.name)}>Edit</a>
						<a style={{ color: "red" }} onClick={() => handleDeleteSecret(record.name)}>Delete</a>
					</span>
				)
			}
		}
	]

	const EmptyState = () => {
		return <div style={{ marginTop: 24 }}>
			<div className="panel">
				<img src={security} />
				<p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Store the secrets required by your services like connection strings, credentials, etc in environment variables or files.<br />
           These secrets can be applied to your services. However you can define who can view these secrets via Galaxy console.</p>
				<Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setSecretModalVisibile(true)}>Add your first secret</Button>
			</div>
		</div>
	}

	const handleSecretModalCancel = () => {
		setSecretModalVisibile(false)
	}

  return (
    <div>
			<Topbar showProjectSelector />
			<div>
				<Sidenav selectedItem="secrets" />
				<div className="page-content">
					<React.Fragment>
						<h3 style={{ display: "flex", justifyContent: "space-between" }}>Secrets <Button onClick={() => setSecretModalVisibile(true)} type="primary">Add</Button></h3>
						<Table columns={columns} dataSource={secretsTableData} />
					</React.Fragment>
					{secretModalVisible && <AddSecret
					handleCancel={handleSecretModalCancel} />}
				</div>
			</div>
		</div>
  );
}

export default Secrets;