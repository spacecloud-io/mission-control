import React from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { Button, Table, Popconfirm } from "antd"
import {useHistory, useParams} from 'react-router-dom';
import deployment from '../../assets/deployment.svg'

const Rules = (props) => {
  const history = useHistory();
  const { projectID } = useParams()
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
    {
			key: '1',
			name: 'SC',
			serviceType: 'Space Cloud',
			instanceType: '8GB 8CPU',
		},
		{
			key: '2',
			name: 'SC',
			serviceType: 'Space Cloud',
			instanceType: '8GB 8CPU',
		},
		{
			key: '3',
			name: 'SC',
			serviceType: 'Space Cloud',
			instanceType: '8GB 8CPU',
		},
  ]
  return (
    <React.Fragment>
      <Topbar />
      <Sidenav selectedItem="deployments" />
      <div className="page-content">
        {!data || data.length === 0 && (
        <div className="panel" style={{ margin: 24 }}>
          <img src={deployment} width="50%" />
          <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Deploy your custom code in minutes to Space Galaxy either directy from your laptop or Docker image</p>
          <Button type="primary action-rounded" style={{ marginTop: 16 }} onClick={() => history.push(`/mission-control/projects/${projectID}/deployments/add`)}>Add deployments</Button>
        </div>
        )}
        {data && data.length !== 0 && (
        <React.Fragment>
          <div style={{marginBottom: 47}}>
							<span style={{fontSize: 18, fontWeight: "bold"}}>Deployments</span>
							<Button type="primary" style={{ float: "right" }} onClick={() => history.push(`/mission-control/projects/${projectID}/deployments/add`)}>Add another deployment</Button>
					</div>
          <Table columns={tableColumns} dataSource={data} />
        </React.Fragment>
        )}
      </div>
    </React.Fragment>
  )
}

export default Rules;