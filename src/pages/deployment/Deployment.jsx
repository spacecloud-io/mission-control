import React from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { Button, Table, Popconfirm } from "antd"
import deployment from '../../assets/deployment.svg'

const Rules = (props) => {
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
      <Sidenav selectedItem="deployment" />
      <div className="page-content">
        <div className="panel" style={{ margin: 24 }}>
          <img src={deployment} width="50%" />
          <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Galaxy provides you with managed services for your data, files, APIs etc. so that you can focus more on developing rather than managing </p>
          <Button type="primary action-rounded" style={{ marginTop: 16 }}>Add managed service</Button>
        </div>
        <React.Fragment>
          <Table columns={tableColumns} dataSource={data} />
        </React.Fragment>
      </div>
    </React.Fragment>
  )
}

export default Rules;