import React, { useState } from 'react';
import './deployment.css';
import DeploymentForm from '../../components/deployment/DeploymentForm';

import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';

import {Button, Table, Popconfirm, Icon, Input} from 'antd'
import {useSelector, useDispatch} from 'react-redux';
import { set } from 'automate-redux';

export default () => {

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const deployments = useSelector(state => state.deployments)
  const dispatch = useDispatch()

  const handleEditClick = name => {
    console.log(name)
  }

  const handleDelete = name => {
    console.log(name)
  }

  const copyURL = () => {
    var copyText = selectedService[0].url;

    /* Select the text field */
    copyText.select()
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
  
    /* Copy the text inside the text field */
    document.execCommand("copy");
  }

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <a onClick={() => {
          const arr = []; 
          arr.push(deployments.find(val => val.name === name))
          setSelectedService(arr);
        }}>{name}</a>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, { name }) => (
        <span>
          <a onClick={() => handleEditClick(name)}>Edit</a>
          <Popconfirm title={`This will remove this deployment. Are you sure?`} onConfirm={() => handleDelete(name)}>
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        </span>
      )
    }
  ]

  const serviceTableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: 'Remarks',
      key: 'remarks'
    }
  ]

  console.log(selectedService)
  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="deployment" />
      <div className="page-content">
        {!deployments && (
        <div style={{ marginTop: 24 }}>
          <div className="panel" style={{ margin: 24 }}>
            {/* <img src={eventTriggersSvg} width="60%" /> */}
            <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Deploy your stateless containers in a serverless fashion. Don't worry, you only pay when its used.</p>
            <Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setModalVisible(true)}>Add Deployment</Button>
          </div>
        </div>
        )}
        {deployments && !selectedService && (
          <React.Fragment>
          <h3 style={{ display: "flex", justifyContent: "space-between" }}>Deployments <Button onClick={() => setModalVisible(true)} type="primary">Add</Button></h3>
          <Table columns={tableColumns} dataSource={deployments} />
        </React.Fragment>
        )}
        {selectedService && (
          <>
          <h3><a style={{marginRight: 10}} onClick={() => setSelectedService(null)}><Icon type="arrow-left"/></a>{selectedService[0].name}</h3>
          <Input addonBefore="URL" suffix={<Icon type="copy" onClick={copyURL} className="copy"/>} defaultValue={selectedService[0].url}></Input>
          <br /><br />
          <h3>Instances</h3>
            <Table columns={serviceTableColumns} dataSource={selectedService} />
          </>
        )}
      </div>
      {modalVisible &&
        <DeploymentForm
          visible={modalVisible}
          handleCancel={() => setModalVisible(false)}
        />}
    </div>
  )
}