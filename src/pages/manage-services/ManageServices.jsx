import React from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { Button, Table, Popconfirm } from "antd"
import manageServices from '../../assets/manage-services.svg'
import {useParams, useHistory} from 'react-router-dom';

const Rules = (props) => {
	const { projectID } = useParams()
	const history = useHistory();
	const tableColumns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name'
		},
		{
			title: 'Service Type',
			dataIndex: 'serviceType',
			key: 'serviceType'
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
					<a>Edit</a>
					<Popconfirm title={`This will remove this endpoint from this service. Are you sure?`}>
						<a style={{ color: "red" }}>Remove</a>
					</Popconfirm>
				</span>
			)
		}
	];
	const data = [
	
	]
	return (
		<React.Fragment>
			<Topbar />
			<div>
				<Sidenav selectedItem="manage-services" />
				<div className="page-content">
					{!data || data.length === 0 && (
					<div className="panel" style={{ margin: 24 }}>
						<img src={manageServices} width="30%" />
						<p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Galaxy provides you with managed services for your data, files, APIs etc. so that you can focus more on developing rather than managing </p>
						<Button type="primary action-rounded" style={{ marginTop: 16 }} onClick={() => history.push(`/mission-control/projects/${projectID}/manage-services/add`)}>Add managed service</Button>
					</div>
					)}
					{data && data.length !== 0 && (
					<React.Fragment>
						<div style={{marginBottom: 47}}>
							<span style={{fontSize: 18, fontWeight: "bold"}}>Managed services</span>
							<Button type="primary" style={{ float: "right" }} onClick={() => history.push(`/mission-control/projects/${projectID}/manage-services/add`)}>Add another service</Button>
						</div>
						<Table columns={tableColumns} dataSource={data} />
					</React.Fragment>
					)}
				</div>
			</div>
		</React.Fragment>
	)
}

export default Rules;