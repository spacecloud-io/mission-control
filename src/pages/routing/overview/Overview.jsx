import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import routingSvg from "../../../assets/routing.svg";
import { Button, Table, Popconfirm, Tag, Space } from "antd";
import IngressRoutingModal from "../../../components/ingress-routing/IngressRoutingModal";
import FilterForm from "../../../components/ingress-routing/FilterForm";
import { set, increment, decrement } from "automate-redux";
import client from "../../../client";
import { setProjectConfig, notify, getProjectConfig, generateId } from "../../../utils";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import IngressTabs from "../../../components/ingress-routing/ingress-tabs/IngressTabs";
import { FilterOutlined } from "@ant-design/icons";

const calculateRequestURL = (routeType, url) => {
  return routeType === "prefix" ? url + "*" : url;
};

const applyFilters = (data, projectId, filters = { services: [], targetHosts: [], requestHosts: [] }) => {
  const { services, targetHosts, requestHosts } = filters
  const serviceHosts = services.map(serviceId => `${serviceId}.${projectId}.svc.cluster.local`)
  const dataFilteredByServices = services.length === 0 ? data : data.filter(obj => obj.targets.some(target => serviceHosts.some(host => host === target.host)))
  const dataFilteredByTargetHosts = targetHosts.length === 0 ? dataFilteredByServices : dataFilteredByServices.filter(obj => obj.targets.some(target => targetHosts.some(host => host === target.host)))
  const dataFilteredByRequestHosts = requestHosts.length === 0 ? dataFilteredByTargetHosts : dataFilteredByTargetHosts.filter(obj => obj.allowedHosts.some(allowedHost => requestHosts.some(host => allowedHost === "*" || allowedHost === host)))
  return dataFilteredByRequestHosts
}

function RoutingOverview() {
  const { projectID } = useParams();
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects);
  const filters = useSelector(state => state.uiState.ingressFilters)
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [routeClicked, setRouteClicked] = useState("");

  useEffect(() => {
    ReactGA.pageview("/projects/ingress-routes");
  }, [])

  let routes = getProjectConfig(projects, projectID, "modules.ingressRoutes", []);
  const serviceNames = [...new Set(getProjectConfig(projects, projectID, "modules.deployments.services", []).map(obj => obj.id))]
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

  const data = routes.map(({ id, source, targets, rule, modify = {} }) => ({
    id: id,
    allowedHosts: source.hosts,
    url: source.url,
    routeType: source.type,
    rewrite: source.rewrite,
    allowedMethods: source.methods,
    targets: targets,
    headers: modify.headers,
    resHeaders: modify.resHeaders,
    requestTemplate: modify.requestTemplate,
    responseTemplate: modify.responseTemplate,
    outputFormat: modify.outputFormat,
    rule: rule
  }));

  const filteredData = applyFilters(data, projectID, filters)

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
          methods: values.allowedMethods,
          url: values.url,
          rewrite: values.rewrite,
          type: values.routeType
        },
        targets: values.targets,
        rule: values.rule,
        modify: {
          headers: values.headers,
          resHeaders: values.resHeaders,
          requestTemplate: values.requestTemplate,
          responseTemplate: values.responseTemplate,
          outputFormat: values.outputFormat
        }
      };
      client.routing
        .setRoutingConfig(projectID, config.id, config)
        .then(() => {
          if (routeId) {
            const newRoutes = routes.map(obj => obj.id === routeId ? config : obj)
            setProjectConfig(projectID, "modules.ingressRoutes", newRoutes)
          } else {
            const newRoutes = [...routes, config]
            setProjectConfig(projectID, "modules.ingressRoutes", newRoutes)
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
        setProjectConfig(projectID, `modules.ingressRoutes`, newRoutes);
        notify("success", "Success", "Deleted rule successfully");
      })
      .catch(ex => notify("error", "Error", ex.toString()))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleModalCancel = () => {
    setRouteClicked("");
    setModalVisible(false);
  };

  const handleFilter = (filters) => dispatch(set("uiState.ingressFilters", filters))

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
      title: <b>{"Targets"}</b>,
      render: (_, { targets }) => (targets && targets.length) ? targets.length : 0
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
      <Sidenav selectedItem="routing" />
      <ProjectPageLayout>
        <IngressTabs projectID={projectID} activeKey="overview" />
        <Content>
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
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                Ingress Routing rules
                <span>
                  <Space>
                    <Button onClick={() => setFilterModalVisible(true)}>
                      Filters <FilterOutlined />
                    </Button>
                    <Button type="primary" onClick={() => setModalVisible(true)}>
                      Add
                    </Button>
                  </Space>
                </span>
              </h3>
              <Table columns={columns} dataSource={filteredData} bordered />
            </React.Fragment>
          )}
          {modalVisible && (
            <IngressRoutingModal
              handleSubmit={(values) => handleSubmit(routeClicked, values)}
              services={services}
              initialValues={routeClickedInfo}
              handleCancel={handleModalCancel}
            />
          )}
          {filterModalVisible && <FilterForm
            initialValues={filters}
            serviceNames={serviceNames}
            handleSubmit={handleFilter}
            handleCancel={() => setFilterModalVisible(false)}
          />}
        </Content>
      </ProjectPageLayout>
    </div>
  );
}

export default RoutingOverview;
