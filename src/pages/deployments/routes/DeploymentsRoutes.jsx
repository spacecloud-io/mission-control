import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RightOutlined } from '@ant-design/icons';
import { Button, Table, Popconfirm, Collapse, Input } from "antd";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import DeploymentTabs from "../../../components/deployments/deployment-tabs/DeploymentTabs"
import RoutingModal from "../../../components/deployments/routing-modal/RoutingModal"
import routingSvg from "../../../assets/routing.svg";
import { notify, incrementPendingRequests, decrementPendingRequests, generateId } from "../../../utils";
import { loadServiceRoutes, saveServiceRoutes, deleteServiceRoutes, getServices, getServiceRoutes } from "../../../operations/deployments";
import { projectModules, actionQueuedMessage } from "../../../constants";
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../../components/utils/empty-search-results/EmptySearchResults";

const { Panel } = Collapse;

const DeploymentsRoutes = () => {
  const { projectID } = useParams();

  useEffect(() => {
    incrementPendingRequests()
    loadServiceRoutes(projectID)
      .catch(ex => notify("error", "Error fetching routes. This page is only available for Kubernetes cluster", ex.toString()))
      .finally(() => decrementPendingRequests())
  }, [projectID])

  // Global state
  const deployments = useSelector(state => getServices(state))
  const serviceRoutes = useSelector(state => getServiceRoutes(state))

  // Component state
  const [modalVisible, setModalVisible] = useState(false)
  const [routeClicked, setRouteClicked] = useState(null)
  const [searchText, setSearchText] = useState('')

  deployments.forEach(obj => {
    if (!serviceRoutes[obj.id]) {
      serviceRoutes[obj.id] = []
    }

    serviceRoutes[obj.id].forEach(route => {
      if (!route.uid) route.uid = generateId();
      if (!route.source.protocol) route.source.protocol = 'http'
      if (!route.requestRetries) route.requestRetries = 3
      if (!route.requestTimeout) route.requestTimeout = 180
    })
  })

  const filteredServiceRoutes = Object.entries(serviceRoutes).filter(route => {
    return route[0].toLowerCase().includes(searchText.toLowerCase())
  })

  const noOfServices = Object.keys(serviceRoutes).length

  const tableColumns = [
    {
      title: "Protocol",
      dataIndex: "protocol",
      key: "protocol",
      render: (value) => {
        return value.toUpperCase();
      }
    },
    {
      title: "Port",
      dataIndex: "port",
      key: "port"
    },
    {
      title: "Targets",
      dataIndex: "targets",
      key: "targets"
    },
    {
      title: "Actions",
      key: "actions",
      className: "column-actions",
      render: (_, { serviceId, uid }) => (
        <span>
          <a onClick={() => handleEditClick(serviceId, uid)}>Edit</a>
          <Popconfirm
            title={`All traffic to this port will be stopped. Are you sure?`}
            onConfirm={() => handleDelete(serviceId, uid)}
          >
            <a style={{ color: "red" }}>Remove</a>
          </Popconfirm>
        </span>
      )
    }
  ];

  const handleEditClick = (serviceId, uid) => {
    const routeConfig = serviceRoutes[serviceId].find(obj => obj.uid === uid)
    setRouteClicked({ serviceId: serviceId, routeConfig: { uid: uid, protocol: routeConfig.source.protocol, port: routeConfig.source.port, requestRetries: routeConfig.requestRetries, requestTimeout: routeConfig.requestTimeout, targets: routeConfig.targets, matchers: routeConfig.matchers } });
    setModalVisible(true);
  };

  const handleSubmit = (serviceId, uid, values) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      const { protocol, port, requestRetries, requestTimeout, targets, matchers } = values
      let routeConfig = {};
      if(protocol === "http"){
        routeConfig = {
          uid: uid,
          id: serviceId,
          source: { protocol, port },
          requestRetries: requestRetries,
          requestTimeout: requestTimeout,
          matchers,
          targets
        }
      }else {
        routeConfig = {
          uid: uid,
          id: serviceId,
          source: { protocol, port },
          targets
        }
      }
      saveServiceRoutes(projectID, serviceId, routeConfig)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Saved service routes successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving service routes", ex)
          reject(ex)
        })
        .finally(() => decrementPendingRequests());
    });
  };

  const handleDelete = (serviceId, uid) => {
    incrementPendingRequests()
    deleteServiceRoutes(projectID, serviceId, uid)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Deleted service route successfully"))
      .catch(ex => notify("error", "Error deleting service route", ex))
      .finally(() => decrementPendingRequests());
  };

  const handleCancel = () => {
    setModalVisible(false);
    setRouteClicked(null);
  };

  const servicePanelHeader = (serviceId, routes) => {
    const rulesText = routes.length === 0 ? "No rules" : (routes.length === 1 ? "1 Rule" : `${routes.length} rules`)
    return (
      <React.Fragment>
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={serviceId ? serviceId.toString() : ''}
        />
        <span style={{ marginLeft: 8, color: "rgba(0,0,0,0.56)" }}>({rulesText})</span>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.DEPLOYMENTS} />
      <div className="page-content page-content--no-padding">
        <DeploymentTabs activeKey='routes' projectID={projectID} />
        <div style={{ padding: "32px 32px 0" }}>
          {
            noOfServices === 0 && <div className="panel">
              <img src={routingSvg} style={{ height: 300 }} />
              <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>No service routing rules yet. You need to first deploy a service.</p>
            </div>
          }
          {
            noOfServices > 0 && <React.Fragment>
              <Input.Search placeholder='Search by service id' style={{ width: '320px', marginBottom: 16 }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
              <Collapse expandIconPosition="right" expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 270 : 90} />}>
                {filteredServiceRoutes.map(([serviceId, routes]) => (<Panel header={servicePanelHeader(serviceId, routes)} key={serviceId}>
                  <div>
                    <div>
                      <span style={{ fontSize: 16, fontWeight: "bold" }}>
                        Routing rules
                     </span>
                      <Button
                        style={{ float: "right" }}
                        onClick={() => {
                          setRouteClicked({ serviceId: serviceId });
                          setModalVisible(true)
                        }}
                      >
                        Add
                    </Button>
                    </div>
                    <Table pagination={false} style={{ marginTop: 16 }} bordered={true} columns={tableColumns} dataSource={routes.map(obj => ({ serviceId, uid: obj.uid, protocol: obj.source.protocol, port: obj.source.port, targets: obj.targets.length }))} />
                  </div>
                </Panel>))}
              </Collapse>
              {Object.keys(serviceRoutes).length !== 0 && searchText &&
                <div style={{ paddingTop: 24 }}>
                  <EmptySearchResults searchText={searchText} />
                </div>
              }
            </React.Fragment>
          }
        </div>
      </div>
      {modalVisible && (
        <RoutingModal
          initialValues={routeClicked.routeConfig}
          handleCancel={handleCancel}
          handleSubmit={(uid, values) => handleSubmit(routeClicked.serviceId, uid, values)}
        />
      )}
    </React.Fragment>
  );
};

export default DeploymentsRoutes;
