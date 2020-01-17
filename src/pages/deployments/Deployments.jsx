import React from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { Button, Table, Popconfirm } from "antd"
import {useHistory, useParams} from 'react-router-dom';
import { useState } from 'react';
import AddDeploymentForm from "../../components/deployments/AddDeploymentForm";
import source_code from "../../assets/source_code.svg";
import docker from "../../assets/docker.png";
import python from "../../assets/python.png"
import js from "../../assets/js.png";
import go from "../../assets/go.png";

const Deployments = (props) => {
  const history = useHistory();
  const { projectID } = useParams()
  const [modalVisibility, setModalVisibility] = useState(false);
  const tableColumns = [
    {
      title: 'Service ID',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Service Type',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (text, record) => {
        switch(text){
          case "docker":
            return <img src={docker} alt="docker.png" />
          case "python":
            return <img src={python} alt="python.png" />
          case "js":
            return <img src={js} alt="js.png" />
          case "go":
            return <img src={go} alt="go.png" />
        }
      }
    },
    {
      title: 'Private URL',
      dataIndex: 'url',
      key: 'url'
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
      name: 'email_service',
      serviceType: 'docker',
      url: 'email_service.proj1-prod.spaceuptech.com',
    },
    {
      key: '2',
      name: 'auth_service',
      serviceType: 'js',
      url: 'auth_service.proj1-prod.spaceuptech.com',
    },
    {
      key: '3',
      name: 'background_service',
      serviceType: 'go',
      url: 'background_service.proj1-prod.spaceuptech.com',
    },
    {
      key: '4',
      name: 'python',
      serviceType: 'python',
      url: 'background_service.proj1-prod.spaceuptech.com',
    }
]

  return (
    <React.Fragment>
      <Topbar />
      <Sidenav selectedItem="deployments" />
      <div className="page-content">
        {!data || data.length === 0 && (
        <div className="panel" style={{ margin: 24 }}>
          <img src={source_code} style={{width: "45%"}} />
          <p className="panel__description" style={{ marginTop: 48, marginBottom: 0, marginLeft: 130, marginRight: 130 }}>Deploy your custom services easily from your laptop to cloud in no time. Space Galaxy deploys your services in a secure service mesh and provides you with a serverless experience by taking care of auto scaling, self healing, etc.</p>
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => setModalVisibility(true)}>Deploy your first service</Button>
        </div>
        )}
        {data && data.length !== 0 && (
        <React.Fragment>
          <div style={{marginBottom: 47}}>
							<span style={{fontSize: 18, fontWeight: "bold"}}>Your Deployments</span>
							<Button style={{ float: "right" }} onClick={() => setModalVisibility(true)}>Add</Button>
					</div>
          <Table bordered={true} columns={tableColumns} dataSource={data} />
        </React.Fragment>
        )}
      </div>
      {modalVisibility && (
          <AddDeploymentForm 
            visible={modalVisibility}
            handleCancel={() => setModalVisibility(false)}
          />
      )}
    </React.Fragment>
  )
}

export default Deployments;