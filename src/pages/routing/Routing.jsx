import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ReactGA from 'react-ga';
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import routingSvg from "../../assets/routing.svg";
import { Button, Table, Popconfirm, Tag } from "antd";
import IngressRoutingModal from "../../components/ingress-routing/IngressRoutingModal";
import { notify, generateId, decrementPendingRequests, incrementPendingRequests, openSecurityRulesPage } from "../../utils";
import { deleteIngressRoute, saveIngressRouteConfig, loadIngressRoutes, getIngressRoutes } from "../../operations/ingressRoutes";
import { securityRuleGroups } from "../../constants";

const calculateRequestURL = (routeType, url) => {
  return routeType === "prefix" ? url + "*" : url;
};

function Routing() {
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/ingress-routes");
  }, [])

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadIngressRoutes(projectID)
        .catch(ex => notify("error", "Error fetching ingress routes", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  // Global state
  let routes = useSelector(state => getIngressRoutes(state))

  // Component state
  const [modalVisible, setModalVisible] = useState(false);
  const [routeClicked, setRouteClicked] = useState("");

  // Derived state
  const data = routes.map(({ id, source, targets, rule, modify = {} }) => ({
    id: id,
    allowedHosts: source.hosts,
    url: source.url,
    routeType: source.type,
    rewrite: source.rewrite,
    allowedMethods: source.methods,
    targets: targets,
    headers: modify.headers,
    requestTemplate: modify.requestTemplate,
    responseTemplate: modify.responseTemplate,
    outputFormat: modify.outputFormat,
    rule: rule
  }));

  const len = routes.length;

  const routeClickedInfo = routeClicked
    ? data.find(obj => obj.id === routeClicked)
    : undefined;

  // Handlers
  const handleSubmit = (routeId, values) => {
    return new Promise((resolve, reject) => {
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
          requestTemplate: values.requestTemplate,
          responseTemplate: values.responseTemplate,
          outputFormat: values.outputFormat
        }
      };
      incrementPendingRequests()
      saveIngressRouteConfig(projectID, config.id, config)
        .then(() => {
          notify("success", "Success", "Saved routing config successfully");
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving routing config", ex)
          reject(ex)
        })
        .finally(() => decrementPendingRequests());
    });
  };

  const handleSecureClick = id => openSecurityRulesPage(projectID, securityRuleGroups.INGRESS_ROUTES, id)

  const handleRouteClick = id => {
    setRouteClicked(id);
    setModalVisible(true);
  };

  const handleDelete = id => {
    incrementPendingRequests()
    deleteIngressRoute(projectID, id)
      .then(() => notify("success", "Success", "Deleted rule successfully"))
      .catch(ex => notify("error", "Error", ex.toString()))
      .finally(() => decrementPendingRequests());
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
      title: <b>{"Targets"}</b>,
      render: (_, { targets }) => (targets && targets.length) ? targets.length : 0
    },
    {
      title: <b>{"Actions"}</b>,
      className: "column-actions",
      render: (_, record) => {
        return (
          <span>
            <a onClick={() => handleRouteClick(record.id)}>Edit</a>
            <a onClick={() => handleSecureClick(record.id)}>Secure</a>
            <Popconfirm
              title={`This will delete all the data. Are you sure?`}
              onConfirm={() => handleDelete(record.id)}
            >
              <a style={{ color: "red" }}>Delete</a>
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
                Ingress Routing rules
                <Button type="primary" onClick={() => setModalVisible(true)}>
                  Add
                </Button>
              </h3>
              <Table columns={columns} dataSource={data} bordered />
            </React.Fragment>
          )}
        </div>
        {modalVisible && (
          <IngressRoutingModal
            handleSubmit={(values) => handleSubmit(routeClicked, values)}
            initialValues={routeClickedInfo}
            handleCancel={handleModalCancel}
          />
        )}
      </div>
    </div>
  );
}

export default Routing;
