import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import { RightOutlined } from '@ant-design/icons';
import { Button, Table, Popconfirm, Collapse } from "antd";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import DeploymentTabs from "../../../components/deployments/deployment-tabs/DeploymentTabs"
import RoutingModal from "../../../components/deployments/routing-modal/RoutingModal"
import routingSvg from "../../../assets/routing.svg";
import client from "../../../client";
import { getProjectConfig, notify, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import { increment, decrement, set } from "automate-redux";
import { loadServiceRoutes, setServiceRoutes } from "../../../operations/deployments";
const { Panel } = Collapse;

const DeploymentsRoutes = () => {
  const { projectID } = useParams();
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects);
  const deployments = getProjectConfig(
    projects,
    projectID,
    "modules.deployments.services",
    []
  );

  const [modalVisible, setModalVisible] = useState(false)
  const [routeClicked, setRouteClicked] = useState(null)

  const getRoutes = () => {
    incrementPendingRequests()
    loadServiceRoutes(projectID)
      .catch(ex => notify("error", "Error fetching routes. This page is only available for Kubernetes cluster", ex.toString()))
      .finally(() => decrementPendingRequests())
  }

  useEffect(() => {
    ReactGA.pageview("/projects/deployments/ingress-routes");
    getRoutes()
  }, [])

  const serviceRoutes = useSelector(state => state.serviceRoutes)

  deployments.forEach(obj => {
    if (!serviceRoutes[obj.id]) {
      serviceRoutes[obj.id] = []
    }
  })

  const noOfServices = Object.keys(serviceRoutes).length

  const tableColumns = [
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
      render: (_, { serviceId, port }) => (
        <span>
          <a onClick={() => handleEditClick(serviceId, port)}>Edit</a>
          <Popconfirm
            title={`All traffic to this port will be stopped. Are you sure?`}
            onConfirm={() => handleDelete(serviceId, port)}
          >
            <a style={{ color: "red" }}>Remove</a>
          </Popconfirm>
        </span>
      )
    }
  ];

  const handleEditClick = (serviceId, port) => {
    const routeConfig = serviceRoutes[serviceId].find(obj => obj.source.port === port)
    setRouteClicked({ serviceId: serviceId, routeConfig: { port: port, targets: routeConfig.targets } });
    setModalVisible(true);
  };

  const handleSubmit = (serviceId, values) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      const { port, targets } = values
      const routeConfig = {
        source: { port },
        targets
      }
      const routes = [routeConfig, ...serviceRoutes[serviceId].filter(obj => obj.source.port !== port)]
      setServiceRoutes(projectID, serviceId, routes)
        .then(() => {
          notify("success", "Success", "Saved service routes successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving service routes", ex)
          reject(ex)
        })
        .finally(() => decrementPendingRequests());
    });
  };

  const handleDelete = (serviceId, port) => {
    incrementPendingRequests()
    const routes = serviceRoutes[serviceId].filter(obj => obj.source.port !== port)
    setServiceRoutes(projectID, serviceId, routes)
      .then(() => notify("success", "Success", "Successfully deleted service route"))
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
      <span>
        {serviceId}<span style={{ marginLeft: 8, color: "rgba(0,0,0,0.56)" }}>({rulesText})</span>
      </span>
    )
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="deployments" />
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
            noOfServices > 0 && <Collapse expandIconPosition="right" expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 270 : 90} />}>
              {Object.entries(serviceRoutes).map(([serviceId, routes]) => (<Panel header={servicePanelHeader(serviceId, routes)} key={serviceId}>
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
                  <Table pagination={false} style={{ marginTop: 16 }} bordered={true} columns={tableColumns} dataSource={routes.map(obj => ({ serviceId, port: obj.source.port, targets: obj.targets.length }))} />
                </div>
              </Panel>))}

            </Collapse>
          }
        </div>
      </div>
      {modalVisible && (
        <RoutingModal
          initialValues={routeClicked.routeConfig}
          handleCancel={handleCancel}
          handleSubmit={(values) => handleSubmit(routeClicked.serviceId, values)}
        />
      )}
    </React.Fragment>
  );
};

export default DeploymentsRoutes;
