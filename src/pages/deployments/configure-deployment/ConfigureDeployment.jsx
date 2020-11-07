import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useHistory } from "react-router";
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import { DeleteOutlined, RightOutlined, PlusOutlined, QuestionCircleFilled } from '@ant-design/icons';
import AddTaskForm from "../../../components/deployments/add-task/AddTaskForm";
import AddAffinityForm from "../../../components/deployments/add-affinity/AddAffinityForm";
import Topbar from "../../../components/topbar/Topbar";
import Sidenav from "../../../components/sidenav/Sidenav";
import { projectModules, actionQueuedMessage } from "../../../constants";
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout";
import { getSecrets } from "../../../operations/secrets";
import { saveService } from "../../../operations/deployments";
import { notify, incrementPendingRequests, decrementPendingRequests, capitalizeFirstCharacter, generateId } from "../../../utils";
import { kedaTriggerTypes } from '../../../constants';

import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Button,
  Collapse,
  Table,
  Popconfirm, Alert, Tooltip
} from "antd";
import AddScalerForm from "../../../components/deployments/add-scaler/AddScalerForm";
const { Panel } = Collapse;

const initialScalers = [
  { name: 'Request per second', type: 'requests-per-second', metadata: { target: "50" } }
]

const ConfigureDeployment = props => {
  const { projectID } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.location.state) {
      setTasks(props.location.state.deploymentClickedInfo.tasks)
      const affinities = props.location.state.deploymentClickedInfo.affinity
      setAffinities(affinities ? affinities : [])
      const scalers = props.location.state.deploymentClickedInfo.autoScale.triggers
      setScalers(scalers ? scalers : [])
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
  const [scalers, setScalers] = useState(initialScalers);
  const [addScalerModalVisibility, setAddScalerModalVisibility] = useState(false);
  const [selectedScalerInfo, setSelectedScalerInfo] = useState(null);

  // Derived state
  const operation = props.location.state && props.location.state.deploymentClickedInfo ? "edit" : "add";
  const scalerNames = scalers.map(scaler => scaler.name)

  const initialValues = operation === "edit" ? props.location.state.deploymentClickedInfo : undefined;
  const formInitialValues = {
    id: initialValues ? initialValues.id : "",
    version: initialValues ? initialValues.version : "",
    pollingInterval: initialValues ? initialValues.autoScale.pollingInterval : 15,
    coolDownInterval: initialValues ? initialValues.autoScale.coolDownInterval : 120,
    min: initialValues ? initialValues.autoScale.minReplicas : 1,
    max: initialValues ? initialValues.autoScale.maxReplicas : 100,
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

  const envSecrets = totalSecrets.filter(secret => secret.type === 'env')

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

  const onAddScalerClick = () => {
    setSelectedScalerInfo(null)
    setAddScalerModalVisibility(true)
  }

  const onAddAffinityClick = () => {
    setSelectedAffinityInfo(null)
    setAddAffinityModalVisibility(true)
  }

  const removeTask = (id) => {
    setTasks(tasks.filter(val => val.id !== id))
  }

  const removeScaler = (name) => {
    setScalers(scalers.filter(val => val.name !== name))
  }

  const removeAffinity = (id) => {
    setAffinities(affinities.filter(val => val.id !== id))
  }

  const handleTaskSubmit = (values, operation) => {

    let newTask = {
      id: values.id,
      ports: values.ports.map((obj, index) =>
        Object.assign(obj, { name: `${obj.protocol}-${index}-${generateId(5)}` })
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
        cmd: values.dockerCmd
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

  const handleScalerSubmit = (values, operation) => {
    if (operation === 'add') {
      setScalers([...scalers, values])
    } else {
      const newScalerArray = scalers.map(val => {
        if (values.name === val.name) {
          return values;
        }
        return val
      })
      setScalers(newScalerArray)
    }
  }

  const handleAffinitySubmit = (values, operation) => {
    if (operation === "add") {
      setAffinities([...affinities, values]);
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
        autoScale: {
          pollingInterval: values.pollingInterval,
          coolDownInterval: values.coolDownInterval,
          replicas: 0,
          minReplicas: Number(values.min),
          maxReplicas: Number(values.max),
          triggers: scalers
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

  const scalersColumn = [
    {
      title: 'Name',
      dataIndex: 'name'
    },
    {
      title: 'Scaler',
      dataIndex: 'type',
      render: (_, { type }) => {
        switch (type) {
          case 'requests-per-second':
            return 'Requests per second';
          case 'active-requests':
            return 'Active requests';
          case 'cpu':
            return 'CPU';
          case 'memory':
            return 'Memory';
          default:
            const kedaType = kedaTriggerTypes.find(({ value }) => value === type)
            return `KEDA (${kedaType ? kedaType.value : type})`;
        }
      }
    },
    {
      title: 'Actions',
      className: 'column-actions',
      render: (_, record) => {
        return (
          <span>
            <a onClick={() => {
              setSelectedScalerInfo(scalers.find(val => val.name === record.name));
              setAddScalerModalVisibility(true);
            }}>
              Edit
            </a>
            <Popconfirm
              title="Are you sure delete this?"
              onConfirm={() => removeScaler(record.name)}
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
              setSelectedAffinityInfo(affinities.find(val => val.id === record.id))
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
        <Content>
          <Row>
            <Col lg={{ span: 18, offset: 3 }} xl={{ span: 16, offset: 4 }}>
              <Card>
                <Form layout="vertical" form={form} initialValues={formInitialValues}>
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
                        <FormItemLabel name='Scalers' extra={<Button style={{ float: 'right' }} onClick={onAddScalerClick}>Add scaler</Button>} />
                        <Alert
                          style={{ margin: '16px 0' }}
                          showIcon
                          type='info'
                          message=' '
                          description='Space Cloud supports autoscaling on multiple scaling paramaters like requests per second, active requests, cpu, ram, etc along with event driven scaling. The highest scale output from the configured scalers would be used to determine the desired scale of a service.' />
                        <Table dataSource={scalers} columns={scalersColumn} pagination={false} style={{ marginBottom: '24px' }} />
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
                          name="Autoscaling nature"
                          description="Control the frequency/behavious of autoscaling"
                        />
                        <Input.Group compact>
                          <Form.Item name="pollingInterval">
                            <Input addonBefore={
                              <div>Polling interval
                                <Tooltip title='The interval to poll the output of scalers'>
                                  <QuestionCircleFilled style={{ marginLeft: '16px' }} />
                                </Tooltip>
                              </div>}
                              style={{ width: 277 }}
                              placeholder='Polling interval' />
                          </Form.Item>
                          <Form.Item name="coolDownInterval">
                            <Input
                              addonBefore={
                                <div>Cooldown interval
                                  <Tooltip title='The interval to wait before scaling down to zero'>
                                    <QuestionCircleFilled style={{ marginLeft: '16px' }} />
                                  </Tooltip>
                                </div>}
                              style={{ width: 324, marginLeft: 32 }}
                              placeholder='Cooldown interval'
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
                                      gutter={16}
                                      key={fields}
                                      className={index === fields.length - 1 ? "bottom-spacing" : ""}
                                    >
                                      <Col span={9}>
                                        <Form.Item
                                          key={[field.name, "projectId"]}
                                          name={[field.name, "projectId"]}
                                          rules={[{ required: true, message: "Please enter the project id of the service!" }]}>
                                          <Input placeholder="Project ID ( * to select all )" />
                                        </Form.Item>
                                      </Col>
                                      <Col span={2} style={{ textAlign: "center" }}>
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
                                          <Input placeholder="Service Name ( * to select all )" />
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
                          description="The upstream services that you want to access"
                        />
                        <Form.List name="upstreams" style={{ display: "inline-block" }}>
                          {(fields, { add, remove }) => {
                            return (
                              <div>
                                {fields.map((field, index) => (
                                  <React.Fragment>
                                    <Row
                                      gutter={16}
                                      key={fields}
                                      className={index === fields.length - 1 ? "bottom-spacing" : ""}
                                    >
                                      <Col span={9}>
                                        <Form.Item
                                          name={[field.name, "projectId"]}
                                          key={[field.name, "projectId"]}
                                          rules={[{ required: true, message: "Please enter the project id of the service!" }]}>
                                          <Input placeholder="Project ID ( * to select all )" />
                                        </Form.Item>
                                      </Col>
                                      <Col span={2} style={{ textAlign: "center" }}>
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
                                          <Input placeholder="Service Name ( * to select all )" />
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
                                    <Row key={field} gutter={16}>
                                      <Col span={10}>
                                        <Form.Item
                                          key={[field.name, "key"]}
                                          name={[field.name, "key"]}
                                          rules={[{ required: true, message: "Please enter key!" }]}>
                                          <Input placeholder="Key" />
                                        </Form.Item>
                                      </Col>
                                      <Col span={10}>
                                        <Form.Item
                                          validateTrigger={["onChange", "onBlur"]}
                                          rules={[{ required: true, message: "Please enter value!" }]}
                                          name={[field.name, "value"]}
                                          key={[field.name, "value"]}
                                        >
                                          <Input placeholder="Value" />
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
                                    <PlusOutlined /> Add a label
                                  </Button>
                                </Form.Item>
                              </div>
                            );
                          }}
                        </Form.List>
                        <FormItemLabel name="Affinities" extra={<Button style={{ float: "right" }} onClick={onAddAffinityClick}>Add affinity</Button>} />
                        <Table dataSource={affinities ? affinities : []} columns={affinitiesColumn} pagination={false} />
                      </Panel>
                    </Collapse>
                    <Button type="primary" block htmlType="submit" style={{ marginTop: 24 }} onClick={() => onDeployService(operation)}>Save</Button>
                  </React.Fragment>
                </Form>
              </Card>
            </Col>
          </Row>
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
      {addScalerModalVisibility && (
        <AddScalerForm
          visible={addScalerModalVisibility}
          initialValues={selectedScalerInfo}
          secrets={envSecrets}
          scalerNames={scalerNames}
          handleCancel={() => setAddScalerModalVisibility(false)}
          handleSubmit={handleScalerSubmit}
        />
      )}
      {addAffinityModalVisibility && (
        <AddAffinityForm
          visible={addAffinityModalVisibility}
          initialValues={selectedAffinityInfo}
          projects={projects}
          projectId={projectID}
          handleCancel={() => setAddAffinityModalVisibility(false)}
          handleSubmit={handleAffinitySubmit}
        />
      )}
    </React.Fragment>
  );
};

export default ConfigureDeployment;
