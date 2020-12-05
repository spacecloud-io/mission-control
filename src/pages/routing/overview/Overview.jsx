import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import routingSvg from "../../../assets/routing.svg";
import { Button, Table, Popconfirm, Tag, Space } from "antd";
import IngressRoutingModal from "../../../components/ingress-routing/IngressRoutingModal";
import { notify, generateId, decrementPendingRequests, incrementPendingRequests, openSecurityRulesPage } from "../../../utils";
import { deleteIngressRoute, saveIngressRouteConfig, loadIngressRoutes, getIngressRoutes } from "../../../operations/ingressRoutes";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import IngressTabs from "../../../components/ingress-routing/ingress-tabs/IngressTabs";
import { FilterOutlined } from "@ant-design/icons";
import FilterForm from "../../../components/ingress-routing/FilterForm";
import { set } from "automate-redux";
import { getUniqueServiceIDs, loadServices } from "../../../operations/deployments";
import { securityRuleGroups, projectModules, actionQueuedMessage } from "../../../constants";
import { getCacheConfig, loadCacheConfig } from "../../../operations/cache";

const calculateRequestURL = (routeType, url) => {
  return routeType === "prefix" ? url + "*" : url;
};

const applyFilters = (data, projectId, filters = { services: [], requestUrls: [], targetHosts: [], requestHosts: [] }) => {
  const { services, requestUrls, targetHosts, requestHosts } = filters
  const serviceHosts = services.map(serviceId => `${serviceId}.${projectId}.svc.cluster.local`)
  const dataFilteredByServices = services.length === 0 ? data : data.filter(obj => obj.targets.some(target => serviceHosts.some(host => host === target.host)))
  const dataFilteredByRequestUrls = requestUrls.length === 0 ? dataFilteredByServices : dataFilteredByServices.filter(obj => requestUrls.some(url => obj.url.includes(url)))
  const dataFilteredByTargetHosts = targetHosts.length === 0 ? dataFilteredByRequestUrls : dataFilteredByRequestUrls.filter(obj => obj.targets.some(target => targetHosts.some(host => host === target.host)))
  const dataFilteredByRequestHosts = requestHosts.length === 0 ? dataFilteredByTargetHosts : dataFilteredByTargetHosts.filter(obj => !obj.allowedHosts || !obj.allowedHosts.length || obj.allowedHosts.some(allowedHost => requestHosts.some(host => allowedHost === "*" || allowedHost === host)))
  return dataFilteredByRequestHosts
}

function RoutingOverview() {
  const { projectID } = useParams();
  const dispatch = useDispatch()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadIngressRoutes(projectID)
        .catch(ex => notify("error", "Error fetching ingress routes", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadServices(projectID)
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  useEffect(() => {
    incrementPendingRequests()
    loadCacheConfig()
      .finally(() => decrementPendingRequests())
  }, [])

  // Global state
  let routes = useSelector(state => getIngressRoutes(state))
  const serviceNames = useSelector(state => getUniqueServiceIDs(state))
  const cacheConfig = useSelector(state => getCacheConfig(state))

  // Component state
  const [modalVisible, setModalVisible] = useState(false);
  const [routeClicked, setRouteClicked] = useState("");
  const filters = useSelector(state => state.uiState.ingressFilters)
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Derived state
  const data = routes.map(({ id, source, targets, rule, modify = {}, isRouteCacheable, cacheOptions }) => ({
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
    rule: rule,
    isRouteCacheable,
    cacheOptions
  }));

  const filteredData = applyFilters(data, projectID, filters)

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
          resHeaders: values.resHeaders,
          requestTemplate: values.requestTemplate,
          responseTemplate: values.responseTemplate,
          outputFormat: values.outputFormat
        },
        isRouteCacheable: values.isRouteCacheable,
        cacheOptions: values.cacheOptions
      };
      incrementPendingRequests()
      saveIngressRouteConfig(projectID, config.id, config)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Saved routing config successfully");
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
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Deleted rule successfully"))
      .catch(ex => notify("error", "Error", ex.toString()))
      .finally(() => decrementPendingRequests());
  };

  const handleModalCancel = () => {
    setRouteClicked("");
    setModalVisible(false);
  };

  const handleFilter = (filters) => dispatch(set("uiState.ingressFilters", filters))

  const columns = [
    {
      title: "Allowed Hosts",
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
      title: "Request URL",
      render: (_, { routeType, url }) => calculateRequestURL(routeType, url)
    },
    {
      title: "Targets",
      render: (_, { targets }) => (targets && targets.length) ? targets.length : 0
    },
    {
      title: "Actions",
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
      <Sidenav selectedItem={projectModules.INGRESS_ROUTES} />
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
                Ingress routes {filteredData.length ? `(${filteredData.length})` : ""}
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
              initialValues={routeClickedInfo}
              handleCancel={handleModalCancel}
              isCachingEnabled={cacheConfig.enabled}
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
