import React, { useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { Button, Table, Popconfirm } from "antd"
import manageServices from '../../assets/manage-services.svg'
import DatabaseAdd from './database/DatabaseAdd'
import { useParams, useHistory } from "react-router-dom"
//import { getProjectConfig, setProjectConfig, notify } from "../../utils"

const Rules = (props) => {
	const [addDatabaseModalVisible, setAddDatabaseModalVisible] = useState(false)
	const { projectID } = useParams()
	const history = useHistory();
	const handleViewClick = (name) => {
		history.push(`/mission-control/projects/${projectID}/manage-services/${name}`)
	}
	const tableColumns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name'
		},
		{
			title: 'DB Type',
			dataIndex: 'DBType',
			key: 'DB Type'
		},
		{
			title: 'Instance type',
			dataIndex: 'instanceType',
			key: 'instanceType'
		},
		{
			title: 'Actions',
			key: 'actions',
			className: 'column-actions',
			render: (_, { name }) => (
				<span>
					<a onClick={() => handleViewClick(name)}>View</a>
					<a>Edit</a>
					<Popconfirm title={`This will remove this endpoint from this service. Are you sure?`}>
						<a style={{ color: "red" }}>Remove</a>
					</Popconfirm>
				</span>
			)
		}
	];
	const data = [
		{
			key: '1',
			name: 'SC',
			DBType: 'mongo',
			instanceType: '8GB 8CPU',
		},
		{
			key: '2',
			name: 'SC',
			DBType: 'mongo',
			instanceType: '8GB 8CPU',
		},
		{
			key: '3',
			name: 'SC',
			DBType: 'mongo',
			instanceType: '8GB 8CPU',
		},
	]
	const dataLength = 0;
	return (
		<React.Fragment>
			<Topbar />
			<div>
				<Sidenav selectedItem="manage-services" />
				{dataLength === 0 ? (
					<div className="page-content">
						<div className="panel" style={{ margin: 24 }}>
							<img src={manageServices} width="30%" height="400px" />
							<p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Galaxy provides you with managed services for your data, files, APIs etc. so that you can focus more on developing rather than managing </p>
							<Button type="primary action-rounded" style={{ marginTop: 16 }} onClick={() => setAddDatabaseModalVisible(true)}>Add managed service</Button>
						</div>
					</div>
				) : (
						<div className="page-content">
							<React.Fragment>
								<h3 style={{ display: "flex", justifyContent: "space-between" }}>Managed Databases <Button onClick={() => setAddDatabaseModalVisible(true)} type="primary">Add</Button></h3>
								<Table columns={tableColumns} dataSource={data} />
							</React.Fragment>
						</div>
					)
				}
			</div>
			{addDatabaseModalVisible && <DatabaseAdd
				handleCancel={() => setAddDatabaseModalVisible(false)}
			/>}
		</React.Fragment>
	)
}

export default Rules;