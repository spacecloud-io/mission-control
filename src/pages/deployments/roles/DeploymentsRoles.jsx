import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Table, Popconfirm, Input, Empty, Tooltip } from "antd";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import DeploymentTabs from "../../../components/deployments/deployment-tabs/DeploymentTabs";
import { notify, incrementPendingRequests, decrementPendingRequests, capitalizeFirstCharacter } from "../../../utils";
import { deleteServiceRoles, getServiceRoles, loadServiceRoles } from "../../../operations/deployments";
import { QuestionCircleFilled } from "@ant-design/icons";
import { projectModules, actionQueuedMessage } from "../../../constants";
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../../components/utils/empty-search-results/EmptySearchResults"

const DeploymentsRoles = () => {
  const { projectID } = useParams();
  const history = useHistory();
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadServiceRoles(projectID)
        .catch(ex => notify("error", "Error fetching service Roles", ex))
        .finally(() => decrementPendingRequests());
    }
  }, [projectID])

  const serviceRoles = useSelector(state => getServiceRoles(state))
  const filteredServiceRole = serviceRoles.filter(role => {
    return role.id.toLowerCase().includes(searchText.toLowerCase()) ||
           role.service.toLowerCase().includes(searchText.toLowerCase())
  })
  const serviceRolesName = serviceRoles.map(role => role.id)


  const handleEditRoleClick = (roleId) => {
    const roleClickedInfo = serviceRoles.find(obj => obj.id === roleId);
    history.push(`/mission-control/projects/${projectID}/${projectModules.DEPLOYMENTS}/roles/${roleId}/edit`, { roleClickedInfo })
  };

  const handleDelete = (roleId, serviceId) => {
    incrementPendingRequests()
    deleteServiceRoles(projectID, serviceId, roleId)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Successfully deleted service role"))
      .catch(ex => notify("error", "Error deleting service role", ex))
      .finally(() => decrementPendingRequests());
  };

  const rolesColumn = [
    {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
      render: (value) => {
        return <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={value ? value.toString() : ''}
        />
      }
    },{
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (value) => {
        return capitalizeFirstCharacter(value)
      },
      filters: [
        { text: 'Project', value: 'project' },
        { text: 'Cluster', value: 'cluster' }
      ],
      onFilter: (value, record) => record.type.indexOf(value) === 0
    },{
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
      render: (value) => {
        return <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={value ? value.toString() : ''}
        />
      }
    },{
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, { id, service }) => {
       return(<span>
          <a onClick={() => handleEditRoleClick(id)}>Edit</a>
          <Popconfirm
            title={`This will remove this deployment config and stop all running instances of it. Are you sure?`}
            onConfirm={() => handleDelete(id, service)}
          >
            <a style={{ color: "red" }}>Remove</a>
          </Popconfirm>
        </span>
      )}
    }
  ]
  
  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.DEPLOYMENTS} />
      <div className='page-content page-content--no-padding'>
        <DeploymentTabs activeKey='roles' projectID={projectID}  /> 
        <div style={{ padding: '32px 32px 0' }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
            <h3 style={{ margin: 'auto 0' }}>Service roles {filteredServiceRole.length ? `(${filteredServiceRole.length})` : ''}
            <Tooltip placement='top' title='Service roles are used to grant access to kubernetes resources (e.g. pods, configmaps, etc) to your services.'>
              <QuestionCircleFilled style={{ marginLeft: '8px', fontSize: '14px' }} />
            </Tooltip>
            </h3>
            <div style={{ display: 'flex' }}>
              <Input.Search placeholder='Search by role name or service id' style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
              <Button style={{ marginLeft: '16px' }} onClick={() => history.push(`/mission-control/projects/${projectID}/${projectModules.DEPLOYMENTS}/roles/add`)} type="primary">Add</Button>
            </div>
          </div>
          <Table
            bordered={true}
            columns={rolesColumn}
            dataSource={filteredServiceRole}
            rowKey={(record) => record.id}
            style={{ marginTop: 16 }}
            locale={{
              emptyText: serviceRoles.length !== 0 ?
                <EmptySearchResults searchText={searchText} /> :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No service roles created yet. Add a service role' />
            }}
          />
        </div>
      </div>
    </React.Fragment>  
  );
};

export default DeploymentsRoles;
