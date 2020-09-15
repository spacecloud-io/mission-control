import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useHistory } from "react-router";
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import { DeleteOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import AddTaskForm from "../../../components/deployments/add-task/AddTaskForm";
import AddAffinityForm from "../../../components/deployments/add-affinity/AddAffinityForm";
import Topbar from "../../../components/topbar/Topbar";
import Sidenav from "../../../components/sidenav/Sidenav";
import { projectModules, actionQueuedMessage } from "../../../constants";
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout";
import { getSecrets } from "../../../operations/secrets";
import { saveService } from "../../../operations/deployments";
import { notify, incrementPendingRequests, decrementPendingRequests, capitalizeFirstCharacter } from "../../../utils";

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

const ConfigureDeployment = props => {
  const { projectID } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.location.state) {
      setTasks(tasks.concat(props.location.state.deploymentClickedInfo.tasks))
      setAffinities(affinities.concat(props.location.state.deploymentClickedInfo.affinity))
    }
  }, [])

  // Global State
  const totalSecrets = useSelector(state => getSecrets(state))
  const projects = useSelector(state => state.projects.map(obj => obj.id))

  // Component state
  const [tasks, setTasks] = useState([]);
  const [affinities, setAffinities] = useState([]);
  const [addTaskModalVisibility, setAddTaskModalVisibility] = useState(false);
  const [addAffinityModalVisibility, setAddAffinityModalVisibility] = useState(false);
  const [selectedTaskInfo, setSelectedTaskInfo] = useState(null);
  const [selectedAffinityInfo, setSelectedAffinityInfo] = useState(null);

  // Derived state
  const operation = props.location.state && props.location.state.deploymentClickedInfo ? "edit" : "add";

  const initialValues = operation === "edit" ? props.location.state.deploymentClickedInfo : undefined;
  const formInitialValues = {
    id: initialValues ? initialValues.id : "",
    version: initialValues ? initialValues.version : "",
    mode: initialValues ? initialValues.scale.mode : "parallel",
    concurrency: initialValues ? initialValues.scale.concurrency : 50,
    min: initialValues ? initialValues.scale.minReplicas : 1,
    max: initialValues ? initialValues.scale.maxReplicas : 100,
    whitelists: (initialValues && initialValues.whitelists && initialValues.whitelists.length > 0) ? initialValues.whitelists : [{ projectId: projectID, service: "*" }],
    upstreams: (initialValues && initialValues.upstreams && initialValues.upstreams.length > 0) ? initialValues.upstreams : [{ projectId: projectID, service: "*" }],
    statsInclusionPrefixes: (initialValues && initialValues.statsInclusionPrefixes) ? initialValues.statsInclusionPrefixes : "http.inbound,cluster_manager,listener_manager",
    labels: (initialValues && Object.keys(initialValues.labels).length > 0) ? Object.entries(initialValues.labels).map(([key, value]) => ({
      key: key,
      value: value
    })) : undefined
  }

  const dockerSecrets = totalSecrets
    .filter(obj => obj.type === "docker")
    .map(obj => obj.id);

  const secrets = totalSecrets
    .filter(obj => obj.type !== "docker")
    .map(obj => obj.id);

  const tasksTableData = tasks.map(val => (
    {
      id: val.id,
      name: val.docker.image
    }
  ))

  // Handlers
  const onAddTaskClick = () => {
    setSelectedTaskInfo(null)
    setAddTaskModalVisibility(true)
  }

  const onAddAffinityClick = () => {
    setSelectedAffinityInfo(null)
    setAddAffinityModalVisibility(true)
  }

  const removeTask = (id) => {
    setTasks(tasks.filter(val => val.id !== id))
  }

  const removeAffinity = (id) => {
    setAffinities(affinities.filter(val => val.id !== id))
  }

  const handleTaskSubmit = (values, operation) => {
    const dockerCommands = selectedTaskInfo ? selectedTaskInfo.docker.cmd : []

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
    if (operation === "add") {
      setTasks(tasks.concat(newTask))
    }
    else {
      const newTasksArray = tasks.map(val => {
        if (val.id === values.id) {
          return newTask
        }
        return val
      })
      setTasks(newTasksArray)
    }
  };

  const handleAffinitySubmit = (values, operation) => {
    if (operation === "add") {
      setAffinities(affinities.concat(values));
    }
    else {
      const newAffinitiesArray = affinities.map(val => {
        if (val.id === values.id) {
          return values
        }
        return val
      })
      setAffinities(newAffinitiesArray)
    }
  }

  const onDeployService = (operation) => {
    form.validateFields().then(values => {
      values = Object.assign({}, formInitialValues, values)
      if (tasks.length === 0) {
        notify("error", "Error", "There should be atleast one task")
        return;
      }

      let config = {
        id: values.id,
        version: values.version,
        projectId: projectID,
        scale: {
          replicas: 0,
          minReplicas: values.min,
          maxReplicas: values.max,
          concurrency: values.concurrency,
          mode: values.mode
        },
        tasks: tasks,
        whitelists: values.whitelists,
        upstreams: values.upstreams,
        statsInclusionPrefixes: values.statsInclusionPrefixes,
        labels: values.labels
          ? values.labels.reduce((prev, curr) => {
            return Object.assign({}, prev, { [curr.key]: curr.value });
          }, {})
          : {},
        affinity: affinities
      };
      incrementPendingRequests()
      saveService(projectID, config.id, config.version, config)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : `${operation === "add" ? "Deployed" : "Updated"} service successfully`)
          history.goBack()
        })
        .catch(ex => {
          notify("error", `Error ${operation === "add" ? "deploying" : "updating"} service`, ex)
        })
        .finally(() => decrementPendingRequests());
    })
  }

  // Columns
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
            <a onClick={() => {
              setSelectedTaskInfo(tasks.find(val => val.id === record.id));
              setAddTaskModalVisibility(true);
            }}>
              Edit
            </a>
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
      render: (_, record) => capitalizeFirstCharacter(record.type)
    },
    {
      title: 'Operator',
      render: (_, record) => capitalizeFirstCharacter(record.operator)
    },
    {
      title: 'Actions',
      className: 'column-actions',
      render: (_, record) => {
        return (
          <span>
            <a onClick={() => {
              setSelectedAffinityInfo(affinities.find(val => val.type === record.type && val.operator === record.operator))
              setAddAffinityModalVisibility(true)
            }}>
              Edit
            </a>
            <Popconfirm
              title="Are you sure delete this?"
              onConfirm={() => removeAffinity(record.id)}
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
        <Content style={{ display: "flex", justifyContent: "center" }}>
          <Card>
            <Form layout="vertical" style={{ width: 720 }} form={form} initialValues={formInitialValues}>
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
                <FormItemLabel name="Tasks" extra={<Button style={{ float: 'right' }} onClick={onAddTaskClick}>Add task</Button>} />
                <Table dataSource={tasksTableData} columns={tasksColumn} pagination={false} />
                <Collapse bordered={false} style={{ background: 'white', marginTop: 24 }}>
                  <Panel header="Advanced" key="1">
                    <br />
                    <FormItemLabel
                      name="Auto scaling"
                      description="Auto scale your container instances between min and max replicas based on the following config"
                    />
                    <Input.Group compact>
                      <Form.Item name="mode" style={{ marginBottom: 0 }}>
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
                    <FormItemLabel name="Affinities" extra={<Button style={{ float: "right" }} onClick={onAddAffinityClick}>Add affinity</Button>} />
                    <Table dataSource={affinities} columns={affinitiesColumn} pagination={false} />
                  </Panel>
                </Collapse>
                <Button type="primary" block htmlType="submit" style={{ marginTop: 24 }} onClick={() => onDeployService(operation)}>Save</Button>
              </React.Fragment>
            </Form>
          </Card>
        </Content>
      </ProjectPageLayout>
      {addTaskModalVisibility && (
        <AddTaskForm
          visible={addTaskModalVisibility}
          initialValues={selectedTaskInfo}
          projectId={projectID}
          dockerSecrets={dockerSecrets}
          secrets={secrets}
          handleCancel={() => setAddTaskModalVisibility(false)}
          handleSubmit={handleTaskSubmit}
        />
      )}
      {addAffinityModalVisibility && (
        <AddAffinityForm
          visible={addAffinityModalVisibility}
          initialValues={selectedAffinityInfo}
          projects={projects}
          handleCancel={() => setAddAffinityModalVisibility(false)}
          handleSubmit={handleAffinitySubmit}
        />
      )}
    </React.Fragment>
  );
};

export default ConfigureDeployment;
