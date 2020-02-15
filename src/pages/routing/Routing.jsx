import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import routingSvg from "../../assets/routing.svg";
import { Button, Table, Popconfirm, Tag } from "antd";
import RoutingRule from "../../components/routing/routingRule";
import { set, increment, decrement } from "automate-redux";
import client from "../../client";
import {
  setProjectConfig,
  notify,
  getProjectConfig,
  generateId
} from "../../utils";

const calculateRequestURL = (routeType, url) => {
  return routeType === "prefix" ? url + "*" : url;
};

const calculateTargetURL = (routeType, url, host, port, rewrite) => {
  return `${host}:${port}${calculateRequestURL(
    routeType,
    rewrite ? rewrite : url
  )}`;
};
function Routing() {
  const { projectID } = useParams();
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects);
  const [modalVisible, setModalVisible] = useState(false);
  const [routeClicked, setRouteClicked] = useState("");

  useEffect(() => {
		ReactGA.pageview("/projects/routing");
  }, [])
  
  let routes = getProjectConfig(projects, projectID, "modules.routes", []);
  if (!routes) routes = []
  const deployments = getProjectConfig(
    projects,
    projectID,
    "modules.deployments.services",
    []
  );
  const services = deployments.map(obj => {
    const ports =
      obj.tasks &&
      obj.tasks[0] &&
      obj.tasks[0].ports &&
      obj.tasks[0].ports.length
        ? obj.tasks[0].ports.map(port => port.port.toString())
        : [];
    return { name: obj.id, ports };
  });

  const data = routes.map(obj => ({
    id: obj.id,
    allowedHosts: obj.source.hosts,
    url: obj.source.url,
    routeType: obj.source.type,
    rewrite: obj.source.rewrite,
    targetHost: obj.dest.host,
    targetPort: obj.dest.port
  }));

  const len = routes.length;

  const routeClickedInfo = routeClicked
    ? data.find(obj => obj.id === routeClicked)
    : undefined;

  const handleSubmit = (routeId, values) => {
    return new Promise((resolve, reject) => {
      dispatch(increment("pendingRequests"));
      const config = {
        id: routeId ? routeId : generateId(),
        source: {
          hosts: values.allowedHosts,
          url: values.url,
          rewrite: values.rewrite,
          type: values.routeType
        },
        dest: {
          host: values.targetHost,
          port: values.targetPort
        }
      };
      client.routing
        .setRoutingConfig(projectID, config.id, config)
        .then(() => {
          if (routeId) {
            const newRoutes = routes.map(obj => obj.id === routeId ? config : obj)
            setProjectConfig(projectID, "modules.routes", newRoutes)
          } else {
            const newRoutes = [...routes, config]
            setProjectConfig(projectID, "modules.routes", newRoutes)
          }
          resolve()
        })
        .catch(ex => reject(ex))
        .finally(() => dispatch(decrement("pendingRequests")));
    });
  };

  const handleRouteClick = id => {
    dispatch(set("routing", routes));
    setRouteClicked(id);
    setModalVisible(true);
  };

  const handleDelete = id => {
    dispatch(increment("pendingRequests"));
    client.routing
      .deleteRoutingConfig(projectID, id)
      .then(() => {
        const newRoutes = routes.filter(route => route.id !== id);
        setProjectConfig(projectID, `modules.routes`, newRoutes);
        notify("success", "Success", "Deleted rule successfully");
      })
      .catch(ex => notify("error", "Error", ex.toString()))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleModalCancel = () => {
    setRouteClicked("");
    setModalVisible(false);
  };

  const columns = [
    {
      title: <b>{"Allowed Hosts"}</b>,
      dataIndex: "allowedHosts",
      key: "allowedHosts",
      render: hosts => (
        <span>
          {hosts.map(host => {
            return <Tag key={host}>{host}</Tag>;
          })}
        </span>
      )
    },
    {
      title: <b>{"Request URL"}</b>,
      render: (_, { routeType, url }) => calculateRequestURL(routeType, url)
    },
    {
      title: <b>{"Target"}</b>,
      render: (_, { routeType, url, targetHost, targetPort, rewrite }) =>
        calculateTargetURL(routeType, url, targetHost, targetPort, rewrite)
    },
    {
      title: <b>{"Actions"}</b>,
      className: "actions",
      render: (_, record) => {
        return (
          <span>
            <a
              style={{ color: "#40A9FF" }}
              onClick={() => {
                handleRouteClick(record.id);
              }}
            >
              Edit
            </a>
            <Popconfirm
              title={`This will delete all the data. Are you sure?`}
              onConfirm={() => handleDelete(record.id)}
            >
              <a style={{ color: "red", paddingLeft: 10 }}>Delete</a>
            </Popconfirm>
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <Topbar showProjectSelector />
      <div>
        <Sidenav selectedItem="routing" />
        <div className="page-content">
          {len === 0 && (
            <div className="panel">
              <img src={routingSvg} style={{ height: 300 }} />
              <p
                className="panel__description"
                style={{ marginTop: 48, marginBottom: 0 }}
              >
                No routes created yet. Create a routing rule to expose your
                deployments to the outer world.
              </p>
              <Button
                type="primary"
                style={{ marginTop: 16 }}
                onClick={() => setModalVisible(true)}
              >
                Create your first route
              </Button>
            </div>
          )}
          {len > 0 && (
            <React.Fragment>
              <h3
                style={{
                  marginTop: 24,
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                Routing rules{" "}
                <Button type="primary" onClick={() => setModalVisible(true)}>
                  Add
                </Button>
              </h3>
              <Table columns={columns} dataSource={data} bordered />
            </React.Fragment>
          )}
        </div>
        {modalVisible && (
          <RoutingRule
            handleSubmit={values => handleSubmit(routeClicked, values)}
            services={services}
            initialValues={routeClickedInfo}
            handleCancel={handleModalCancel}
          />
        )}
      </div>
    </div>
  );
}

export default Routing;
