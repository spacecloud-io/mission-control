import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import { DeleteOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import AddTaskForm from "../../../components/deployments/add-task/AddTaskForm";
import AddAffinityForm from "../../../components/deployments/add-affinity/AddAffinityForm";
import Topbar from "../../../components/topbar/Topbar";
import Sidenav from "../../../components/sidenav/Sidenav";
import { projectModules, deploymentStatuses } from "../../../constants";
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout";
import { getSecrets } from "../../../operations/secrets";
import { getServices, getServicesStatus } from "../../../operations/deployments";

import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Select,
  Button,
  Collapse,
  Table,
  Popconfirm
} from "antd";
const { Option } = Select;
const { Panel } = Collapse;

const AddDeployment = props => {
  const { projectID } = useParams();
  const { initialValues } = props;
  const [form] = Form.useForm();

  // Global State
  const deployments = useSelector(state => getServices(state))
  const deploymentStatus = useSelector(state => getServicesStatus(state));
  const totalSecrets = useSelector(state => getSecrets(state))

  // Component state
  const [tasks, setTasks] = useState([]);
  const [affinities, setAffinities] = useState([]);
  const [addTaskModalVisibility, setAddTaskModalVisibility] = useState(false);
  const [addAffinityModalVisibility, setAddAffinityModalVisibility] = useState(false);
  const [deploymentClicked, setDeploymentClicked] = useState(null);

  const formInitialValues = {
    id: initialValues ? initialValues.id : "",
    version: initialValues ? initialValues.version : "",
    registryType: initialValues ? initialValues.registryType : "public",
    dockerImage: initialValues ? initialValues.dockerImage : "",
    dockerSecret: initialValues ? initialValues.dockerSecret : "",
    imagePullPolicy: initialValues ? initialValues.imagePullPolicy : "pull-if-not-exists",
    cpu: initialValues ? initialValues.cpu : 0.1,
    memory: initialValues ? initialValues.memory : 100,
    addGPUs: initialValues && initialValues.gpuType ? true : false,
    gpuType: initialValues ? initialValues.gpuType : "nvdia",
    gpuCount: initialValues ? initialValues.gpuCount : 1,
    concurrency: initialValues ? initialValues.concurrency : 50,
    min: initialValues ? initialValues.min : 1,
    max: initialValues ? initialValues.max : 100,
    secrets: initialValues ? initialValues.secrets : [],
    autoscalingMode: initialValues ? initialValues.autoscalingMode : "parallel",
    ports: (initialValues && initialValues.ports.length > 0) ? initialValues.ports : [{ protocol: "http", port: "" }],
    env: (initialValues && initialValues.env.length > 0) ? initialValues.env : [],
    whitelists: (initialValues && initialValues.whitelists.length > 0) ? initialValues.whitelists : [{ projectId: props.projectId, service: "*" }],
    upstreams: (initialValues && initialValues.upstreams.length > 0) ? initialValues.upstreams : [{ projectId: props.projectId, service: "*" }],
    statsInclusionPrefixes: initialValues && initialValues.statsInclusionPrefixes ? initialValues.statsInclusionPrefixes : "http.inbound,cluster_manager,listener_manager"
  }

  // Derived state
  const dockerSecrets = totalSecrets
    .filter(obj => obj.type === "docker")
    .map(obj => obj.id);
  const secrets = totalSecrets
    .filter(obj => obj.type !== "docker")
    .map(obj => obj.id);

  const data = deployments.map(obj => {
    const task = obj.tasks && obj.tasks.length ? obj.tasks[0] : {};
    return {
      id: obj.id,
      version: obj.version,
      serviceType: task.runtime,
      dockerImage: task.docker.image,
      dockerSecret: task.docker.secret,
      imagePullPolicy: task.docker.imagePullPolicy,
      secrets: task.secrets ? task.secrets : [],
      registryType: task.docker.secret ? "private" : "public",
      ports: task.ports,
      cpu: task.resources.cpu / 1000,
      memory: task.resources.memory,
      gpuType: task.resources.gpu ? task.resources.gpu.type : "",
      gpuCount: task.resources.gpu ? task.resources.gpu.value : 0,
      min: obj.scale.minReplicas,
      max: obj.scale.maxReplicas,
      replicas: obj.scale.replicas,
      autoscalingMode: obj.scale.mode,
      concurrency: obj.scale.concurrency,
      env: task.env
        ? Object.entries(task.env).map(([key, value]) => ({
          key: key,
          value: value
        }))
        : [],
      whitelists: obj.whitelists,
      upstreams: obj.upstreams,
      statsInclusionPrefixes: obj.statsInclusionPrefixes,
      desiredReplicas: deploymentStatus[obj.id] && deploymentStatus[obj.id][obj.version] ? deploymentStatus[obj.id][obj.version].desiredReplicas : 0,
      totalReplicas: deploymentStatus[obj.id] && deploymentStatus[obj.id][obj.version] && deploymentStatus[obj.id][obj.version].replicas ? deploymentStatus[obj.id][obj.version].replicas.filter(obj => obj.status === deploymentStatuses.RUNNING).length : 0,
      deploymentStatus: deploymentStatus[obj.id] && deploymentStatus[obj.id][obj.version] && deploymentStatus[obj.id][obj.version].replicas ? deploymentStatus[obj.id][obj.version].replicas : []
    };
  });

  const deploymentClickedInfo = deploymentClicked
    ? data.find(
      obj =>
        obj.id === deploymentClicked.serviceId &&
        obj.version === deploymentClicked.version
    )
    : undefined;

  const tasksTableData = tasks.map(val => (
    {
      id: val.id,
      name: val.docker.image
    }
  ))

  const handleTaskSubmit = (operation, values) => {
    const c = deploymentClicked ? deployments.find(obj => obj.id === deploymentClicked.serviceId && obj.version === deploymentClicked.version) : undefined
    const dockerCommands = (c && c.tasks && c.tasks.length) ? c.tasks[0].docker.cmd : []

    let newTask = {
      id: values.id,
      ports: values.ports.map(obj =>
        Object.assign(obj, { name: obj.protocol })
      ),
      resources: {
        cpu: values.cpu * 1000,
        memory: values.memory,
        gpu: values.gpu,
      },
      docker: {
        image: values.dockerImage,
        secret: values.dockerSecret,
        imagePullPolicy: values.imagePullPolicy,
        cmd: dockerCommands
      },
      secrets: values.secrets,
      env: values.env
        ? values.env.reduce((prev, curr) => {
          return Object.assign({}, prev, { [curr.key]: curr.value });
        }, {})
        : {},
      runtime: values.serviceType
    };
    setTasks(tasks.concat(newTask))
    /*       incrementPendingRequests()
          saveService(projectID, config.id, config.version, config)
            .then(({ queued }) => {
              notify("success", "Success", queued ? actionQueuedMessage : `${operation === "add" ? "Deployed" : "Updated"} service successfully`)
              resolve()
            })
            .catch(ex => {
              notify("error", `Error ${operation === "add" ? "deploying" : "updating"} service`, ex)
              reject(ex)
            })
            .finally(() => decrementPendingRequests()); */
  };

  const handleAffinitySubmit = (values) => {
    console.log(values)
    setAffinities(affinities.concat(values));
  }

  const handleCancel = () => {
    setAddTaskModalVisibility(false);
    setDeploymentClicked(null);
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(val => val.id !== id))
  }

  const tasksColumn = [
    {
      title: 'Task ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Docker container',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Actions',
      className: 'column-actions',
      render: (_, record) => {
        return (
          <span>
            <a>Edit</a>
            <Popconfirm
              title="Are you sure delete this?"
              onConfirm={() => removeTask(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </span>
        )
      }
    }
  ]

  const affinitiesColumn = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: 'Actions',
      className: 'column-actions',
      render: (_, record) => {
        return (
          <span>
            <a>Edit</a>
            <Popconfirm
              title="Are you sure delete this?"
              onConfirm={() => console.log(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </span>
        )
      }
    }
  ]

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.DEPLOYMENTS} />
      <ProjectPageLayout>
        <InnerTopBar title="Deploy service" />
        <Content>
          <Card>
            <Form layout="vertical" style={{ maxWidth: 720 }} form={form} initialValues={formInitialValues}>
              <React.Fragment>
                <FormItemLabel name="Service ID" />
                <Form.Item name="id" rules={[
                  {
                    validator: (_, value, cb) => {
                      if (!value) {
                        cb("Please provide a service id!")
                        return
                      }
                      if (!(/^[0-9a-zA-Z]+$/.test(value))) {
                        cb("Service ID can only contain alphanumeric characters!")
                        return
                      }
                      cb()
                    }
                  }
                ]}>
                  <Input
                    placeholder="Unique name for your service"
                    style={{ width: 288 }}
                    disabled={initialValues ? true : false}
                  />
                </Form.Item>
                <FormItemLabel name="Version" />
                <Form.Item name="version" rules={[
                  {
                    validator: (_, value, cb) => {
                      if (!value) {
                        cb("Please provide a version!")
                        return
                      }
                      if (!(/^[0-9a-zA-Z_.]+$/.test(value))) {
                        cb("Version can only contain alphanumeric characters, dots and underscores!")
                        return
                      }
                      cb()
                    }
                  }
                ]}>
                  <Input
                    placeholder="Version of your service (example: v1)"
                    style={{ width: 288 }}
                    disabled={initialValues ? true : false}
                  />
                </Form.Item>
                <FormItemLabel name="Tasks" extra={<Button style={{ float: 'right' }} onClick={() => setAddTaskModalVisibility(true)}>Add task</Button>} />
                <Table dataSource={tasksTableData} columns={tasksColumn} />
                <Collapse bordered={false} style={{ background: 'white' }}>
                  <Panel header="Advanced" key="1">
                    <br />
                    <FormItemLabel
                      name="Auto scaling"
                      description="Auto scale your container instances between min and max replicas based on the following config"
                    />
                    <Input.Group compact>
                      <Form.Item name="autoscalingMode" style={{ marginBottom: 0 }}>
                        <Select placeholder="Select auto scaling mode">
                          <Option value="per-second">Requests per second</Option>
                          <Option value="parallel">Parallel requests</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="concurrency">
                        <Input style={{ width: 400 }} min={1} />
                      </Form.Item>
                    </Input.Group>
                    <FormItemLabel name="Replicas" />
                    <Input.Group compact>
                      <Form.Item name="min">
                        <Input addonBefore="Min" style={{ width: 160 }} min={0} />
                      </Form.Item>
                      <Form.Item name="max">
                        <Input
                          addonBefore="Max"
                          style={{ width: 160, marginLeft: 32 }}
                          min={1}
                        />
                      </Form.Item>
                    </Input.Group>
                    <FormItemLabel
                      name="Whitelists"
                      description="Only those services that are whitelisted can access you"
                    />
                    {/* Whitelists */}
                    <Form.List name="whitelists" style={{ display: "inline-block" }}>
                      {(fields, { add, remove }) => {
                        return (
                          <div>
                            {fields.map((field, index) => (
                              <React.Fragment>
                                <Row
                                  key={fields}
                                  className={index === fields.length - 1 ? "bottom-spacing" : ""}
                                >
                                  <Col span={9}>
                                    <Form.Item
                                      key={[field.name, "projectId"]}
                                      name={[field.name, "projectId"]}
                                      style={{ display: "inline-block" }}
                                      rules={[{ required: true, message: "Please enter the project id of the service!" }]}>
                                      <Input
                                        style={{ width: 230 }}
                                        placeholder="Project ID ( * to select all )"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <RightOutlined style={{ fontSize: 12 }} />
                                  </Col>
                                  <Col span={9}>
                                    <Form.Item
                                      validateTrigger={["onChange", "onBlur"]}
                                      rules={[{ required: true, message: "Please enter the name of the service!" }]}
                                      key={[field.name, "service"]}
                                      name={[field.name, "service"]}
                                      style={{ marginRight: 30 }}
                                    >
                                      <Input
                                        style={{ width: 230 }}
                                        placeholder="Service Name ( * to select all )"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={3}>
                                    {fields.length > 1 ? (
                                      <DeleteOutlined
                                        style={{ lineHeight: "32px" }}
                                        onClick={() => {
                                          remove(field.name);
                                        }}
                                      />
                                    ) : null}
                                  </Col>
                                </Row>
                              </React.Fragment>
                            ))}
                            <Form.Item>
                              <Button
                                onClick={() => {
                                  form.validateFields([...fields.map(obj => ["whitelists", obj.name, "projectId"]), ...fields.map(obj => ["whitelists", obj.name, "service"])])
                                    .then(() => add({ projectID }))
                                    .catch(ex => console.log("Exception", ex))
                                }}
                                style={{ marginTop: -10 }}
                              >
                                <PlusOutlined /> Add another upstream service
                          </Button>
                            </Form.Item>
                          </div>
                        );
                      }}
                    </Form.List>
                    <FormItemLabel
                      name="Upstreams"
                      description="The upstream servces that you want to access"
                    />
                    <Form.List name="upstreams" style={{ display: "inline-block" }}>
                      {(fields, { add, remove }) => {
                        return (
                          <div>
                            {fields.map((field, index) => (
                              <React.Fragment>
                                <Row
                                  key={fields}
                                  className={index === fields.length - 1 ? "bottom-spacing" : ""}
                                >
                                  <Col span={9}>
                                    <Form.Item
                                      name={[field.name, "projectId"]}
                                      key={[field.name, "projectId"]}
                                      style={{ display: "inline-block" }}
                                      rules={[{ required: true, message: "Please enter the project id of the service!" }]}>
                                      <Input
                                        style={{ width: 230 }}
                                        placeholder="Project ID ( * to select all )"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <RightOutlined style={{ fontSize: 12 }} />
                                  </Col>
                                  <Col span={9}>
                                    <Form.Item
                                      validateTrigger={["onChange", "onBlur"]}
                                      rules={[{ required: true, message: "Please enter the name of the service!" }]}
                                      key={[field.name, "service"]}
                                      name={[field.name, "service"]}
                                      style={{ marginRight: 30 }}
                                    >
                                      <Input
                                        style={{ width: 230 }}
                                        placeholder="Service Name ( * to select all )"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={3}>
                                    {fields.length > 1 ? (
                                      <DeleteOutlined
                                        style={{ lineHeight: "32px" }}
                                        onClick={() => {
                                          remove(field.name);
                                        }}
                                      />
                                    ) : null}
                                  </Col>
                                </Row>
                              </React.Fragment>
                            ))}
                            <Form.Item>
                              <Button
                                onClick={() => {
                                  form.validateFields([...fields.map(obj => ["upstreams", obj.name, "projectId"]), ...fields.map(obj => ["upstreams", obj.name, "service"])])
                                    .then(() => add({ projectID }))
                                    .catch(ex => console.log("Exception", ex))
                                }}
                                style={{ marginTop: -10 }}
                              >
                                <PlusOutlined /> Add another upstream service
                          </Button>
                            </Form.Item>
                          </div>
                        );
                      }}
                    </Form.List>
                    <FormItemLabel
                      name="Envoy stats"
                      description="The statistics that the envoy proxy should generate"
                    />
                    <Form.Item name="statsInclusionPrefixes">
                      <Input placeholder="CSV of envoy statistics" />
                    </Form.Item>
                    <FormItemLabel name="Labels" />
                    <Form.List name="labels" style={{ display: "inline-block" }}>
                      {(fields, { add, remove }) => {
                        return (
                          <div>
                            {fields.map((field) => (
                              <React.Fragment>
                                <Row key={field}>
                                  <Col span={10}>
                                    <Form.Item
                                      key={[field.name, "key"]}
                                      name={[field.name, "key"]}
                                      style={{ display: "inline-block" }}
                                      rules={[{ required: true, message: "Please enter key!" }]}>
                                      <Input placeholder="Key" style={{ width: 280 }} />
                                    </Form.Item>
                                  </Col>
                                  <Col span={10}>
                                    <Form.Item
                                      validateTrigger={["onChange", "onBlur"]}
                                      rules={[{ required: true, message: "Please enter value!" }]}
                                      name={[field.name, "value"]}
                                      key={[field.name, "value"]}
                                    >
                                      <Input
                                        style={{ width: 280, marginRight: 30 }}
                                        placeholder="Value"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={4}>
                                    <DeleteOutlined
                                      style={{ lineHeight: "32px" }}
                                      onClick={() => {
                                        remove(field.name);
                                      }}
                                    />
                                  </Col>
                                </Row>
                              </React.Fragment>
                            ))}
                            <Form.Item>
                              <Button
                                onClick={() => {
                                  form.validateFields([...fields.map(obj => ["labels", obj.name, "key"]), ...fields.map(obj => ["labels", obj.name, "value"])])
                                    .then(() => add())
                                    .catch(ex => console.log("Exception", ex))
                                }}
                                style={{ marginTop: -10 }}
                              >
                                <PlusOutlined /> Add an environment variable
                                  </Button>
                            </Form.Item>
                          </div>
                        );
                      }}
                    </Form.List>
                    <FormItemLabel name="Affinities" extra={<Button style={{ float: "right" }} onClick={() => setAddAffinityModalVisibility(true)}>Add affinity</Button>} />
                    <Table dataSource={affinities} columns={affinitiesColumn} />
                  </Panel>
                </Collapse>
              </React.Fragment>
            </Form>
            <Button type="primary" block >Save</Button>
          </Card>
        </Content>
      </ProjectPageLayout>
      {addTaskModalVisibility && (
        <AddTaskForm
          visible={addTaskModalVisibility}
          /* initialValues={deploymentClickedInfo} */
          projectId={projectID}
          dockerSecrets={dockerSecrets}
          secrets={secrets}
          handleCancel={handleCancel}
          handleSubmit={values =>
            handleTaskSubmit(/* deploymentClickedInfo */ false ? "update" : "add", values)
          }
        />
      )}
      {addAffinityModalVisibility && (
        <AddAffinityForm
          visible={addAffinityModalVisibility}
          handleCancel={() => setAddAffinityModalVisibility(false)}
          handleSubmit={values => handleAffinitySubmit(values)}
        />
      )}
    </React.Fragment>
  );
};

export default AddDeployment;
