import React, { useState } from 'react';
import './deployment.css';
import DeploymentForm from '../../components/deployment/DeploymentForm';

import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';

import { Button, Table, Popconfirm, Icon, Descriptions, message } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector, useDispatch } from 'react-redux';
import { set } from 'automate-redux';
import eventTriggersSvg from "../../assets/event-triggers.svg";

const CopyButton = ({ value }) => {
  return <CopyToClipboard text={value} onCopy={() => message.success("Copied to clipboard!")}>
    <i className="material-icons copy" style={{ cursor: "pointer" }}>content_copy</i>
  </CopyToClipboard>
}

export default () => {

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState({});
  const deployments = useSelector(state => state.deployments)
  const dispatch = useDispatch()

  const ServiceTopBar = ({ serviceName }) => {

    return <div style={{
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
      height: 48,
      lineHeight: 48,
      zIndex: 98,
      display: "flex",
      alignItems: "center",
      padding: "0 16px"
    }}>
      <Button type="link" onClick={() => setSelectedService(null)}>
        <Icon type="left" />
        Go back
        </Button>
      <span style={{ marginLeft: 16 }}>
        {serviceName}
      </span>
    </div>
  }

  const handleEditClick = name => {
    setSelectedServiceDetails(deployments.find(val => val.name === name));
    setModalVisible(true)
  }

  const handleDelete = name => {
    dispatch(set('deployments', deployments.filter(val => val.name !== name)))
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
          <a onClick={(e) => {
            handleEditClick(name);
            e.stopPropagation();
          }
          }>
            Edit</a>
          <Popconfirm
            title={`This will remove this deployment. Are you sure?`}
            onConfirm={(e) => {
              handleDelete(name);
              e.stopPropagation()
            }
            }>
            <a style={{ color: "red" }} onClick={(e) => e.stopPropagation()}>Delete</a>
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

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="deployment" />
      <div className="page-content page-content--no-padding">
        {deployments.length === 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="panel" style={{ margin: 24 }}>
              <img src={eventTriggersSvg} width="60%" /> 
              <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Deploy your stateless containers in a serverless fashion. Don't worry, you only pay when its used.</p>
              <Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setModalVisible(true)}>Add Deployment</Button>
            </div>
          </div>
        )}
        {deployments.length > 0 && !selectedService && (
          <React.Fragment>
            <div style={{ padding: "32px 32px 0" }}>
              <h3 style={{ display: "flex", justifyContent: "space-between" }}>Deployments <Button onClick={() => setModalVisible(true)} type="primary">Add</Button></h3>
              <Table
                columns={tableColumns}
                dataSource={deployments}
                onRow={(record, rowIndex) => {
                  return {
                    onClick: event => {
                      const arr = [];
                      arr.push(deployments.find(val => val.name === record.name))
                      setSelectedService(arr);
                    }
                  };
                }}
              />
            </div>
          </React.Fragment>
        )}
        {selectedService && (
          <>
            <ServiceTopBar serviceName={selectedService[0].name} />
            <div style={{ padding: "32px 32px 0" }}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="URL" >{selectedService[0].url}<CopyButton value={selectedService[0].url} /></Descriptions.Item>
              </Descriptions>
              <br /><br />
              <h3>Instances</h3>
              <Table columns={serviceTableColumns} dataSource={selectedService} />
            </div>
          </>
        )}
      </div>
      {modalVisible &&
        <DeploymentForm
          visible={modalVisible}
          initialValues={selectedServiceDetails}
          handleCancel={() => { setModalVisible(false); setSelectedServiceDetails({}) }}
        />}
    </div>
  )
}