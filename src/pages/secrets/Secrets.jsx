import React, { useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import security from '../../assets/security.svg';
import { Button, Table, Popconfirm } from 'antd';
import AddSecret from '../../components/secret/AddSecret';
import { getSecretType } from '../../utils';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch} from 'react-redux';
import { set } from 'automate-redux';

const Secrets = () => {
	const history = useHistory();
	const { projectID } = useParams();
	const dispatch = useDispatch();
	const [secretModalVisible, setSecretModalVisible] = useState(false);
	const [secretType, setSecretType] = useState("");

	const handleSecretView = (name, type) => {
		setSecretType(getSecretType(type))
		dispatch(set("secretType", type))
		history.push(`/mission-control/projects/${projectID}/secrets/${name}`)
	}
	
	const handleDeleteSecret = (name) => {
		
	}

	const secretsTableData = [
		{
			name: "my_secret",
			type: "env var"
		},
		{
			name: "docker_credentials",
			type: "docker secret"
		},
		{
			name: "AWS_S3_credentials",
			type: "file secret"
		},
		{
			name: "custom_data",
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
				return (
					<span>
						<a onClick={() => handleSecretView(record.name, record.type)}>View</a>
						<Popconfirm title={`This will delete the secrets. Are you sure?`} onConfirm={handleDeleteSecret}>
                            <a style={{ color: "red" }}>Delete</a>
                        </Popconfirm>	
					</span>
				)
			}
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
						<h3 style={{ display: "flex", justifyContent: "space-between" }}>Secrets <Button onClick={() => setSecretModalVisible(true)} type="primary">Add</Button></h3>
						<Table columns={columns} dataSource={secretsTableData} bordered={true} />
					{secretModalVisible && <AddSecret eachAdd={false}
					handleCancel={handleSecretModalCancel}/>}
				</div>
			</div>
		</div>
  );
}

export default Secrets;