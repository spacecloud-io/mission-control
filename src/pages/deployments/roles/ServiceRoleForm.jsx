import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Form, Input, Select, Table, Button, Tooltip, Popconfirm, Tag } from 'antd';
import ProjectPageLayout, { Content, InnerTopBar } from '../../../components/project-page-layout/ProjectPageLayout';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import { projectModules, actionQueuedMessage } from '../../../constants';
import FormItemLabel from '../../../components/form-item-label/FormItemLabel';
import ConditionalFormBlock from '../../../components/conditional-form-block/ConditionalFormBlock';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AddRuleForm from '../../../components/deployments/add-rules/AddRulesForm';
import { QuestionCircleFilled } from '@ant-design/icons';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../../utils';
import { saveServiceRoles, getServiceRoles } from '../../../operations/deployments';

const ServiceRoleForm = (props) => {

  const { projectID, roleName } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.location.state) {
      setRules(props.location.state.roleClickedInfo.rules)
    }
  }, [])


  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(-1);
  const [rules, setRules] = useState([]);

  const selectedRuleInfo = selectedRuleIndex === -1 ? undefined : rules.find((_, i) => i === selectedRuleIndex)

  const operation = props.location.state && props.location.state.roleClickedInfo ? "edit" : "add";
  const initialValues = operation === "edit" ? props.location.state.roleClickedInfo : undefined;

  const formInitialValues = {
    id: initialValues && initialValues.id ? initialValues.id : '',
    type: initialValues && initialValues.type ? initialValues.type : 'project',
    project: initialValues && initialValues.project ? initialValues.project : '',
    service: initialValues && initialValues.service ? initialValues.service : ''
  }

  useEffect(() => {
    form.setFieldsValue(formInitialValues)
  }, [formInitialValues.id, formInitialValues.type])

  const serviceRoles = useSelector(state => getServiceRoles(state))
  const serviceRolesName = serviceRoles.map(role => role.id)

  const handleRuleSubmit = (values, operation) => {
    if (operation === 'add') {
      setRules([...rules, values])
    } else {
      const newRuleArray = rules.map((val, i) => {
        if (i === selectedRuleIndex) {
          return values;
        }
        return val
      })
      setRules(newRuleArray)
    }
  }

  const handleRuleCancel = () => {
    setRuleModalVisible(false)
    setSelectedRuleIndex(-1)
  }

  const onAddRuleClick = () => {
    setSelectedRuleIndex(-1)
    setRuleModalVisible(true)
  }

  const removeRule = (ruleIndex) => {
    setRules(rules.filter((val, index) => index !== ruleIndex))
  }

  const onSubmitServiceRole = (operation) => {
    form.validateFields().then(values => {
      values = Object.assign({}, formInitialValues, values)
      if (rules.length === 0) {
        notify("error", "Error", "There should be atleast one rule")
        return;
      }

      let roleConfig = {}
      if (values.type === 'project') {
        roleConfig = {
          id: values.id,
          type: values.type,
          project: values.project,
          service: values.service,
          rules: rules
        };
      } else {
        roleConfig = {
          id: values.id,
          type: values.type,
          service: values.service,
          rules: rules
        };
      }
      incrementPendingRequests()
      saveServiceRoles(projectID, roleConfig.service, roleConfig.id, roleConfig)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : `${operation === "add" ? "Created" : "Updated"} service role successfully`)
          history.goBack()
        })
        .catch(ex => {
          notify("error", `Error ${operation === "add" ? "creating" : "updating"} service role`, ex)
        })
        .finally(() => decrementPendingRequests());
    })
  }

  const ruleColumn = [
    {
      title: 'API groups',
      dataIndex: 'apiGroups',
      key: 'apiGroups',
      width: '25%',
      render: (value) => {
        if (value && value.length === 1 && value[0] === "") {
          return <Tag>""</Tag>
        }
        return value.map(val => <Tag>{val}</Tag>)
      }
    },
    {
      title: 'Verbs',
      dataIndex: 'verbs',
      key: 'verbs',
      width: '25%',
      render: (value) => {
        return value.map(val => <Tag>{val}</Tag>)
      }
    },
    {
      title: 'Resources',
      dataIndex: 'resources',
      key: 'resources',
      width: '25%',
      render: (value) => {
        return value.map(val => <Tag>{val}</Tag>)
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, record, index) => {
        return (<span>
          <a onClick={() => {
            setSelectedRuleIndex(index)
            setRuleModalVisible(true);
          }}>
            Edit
         </a>
          <Popconfirm
            title={`This will remove this deployment config and stop all running instances of it. Are you sure?`}
            onConfirm={() => removeRule(index)}
            okText="Yes"
            cancelText="No"
          >
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        </span>
        )
      }
    },
  ]

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.DEPLOYMENTS} />
      <ProjectPageLayout>
        <InnerTopBar title={roleName ? 'Edit service role' : 'Add service role'} />
        <Content>
          <Row>
            <Col lg={{ span: 18, offset: 3 }} xl={{ span: 16, offset: 4 }}>
              <Card>
                <Form form={form} initialValues={formInitialValues} onFinish={onSubmitServiceRole}>
                  <FormItemLabel name='Role name' />
                  <Form.Item name='id' rules={[{
                    validator: (_, value, cb) => {
                      if (!value) {
                        cb("Please input a role name")
                        return
                      }
                      const check = serviceRolesName.some(data => value === data);
                      if (check && !roleName) {
                        cb("This name is already taken by another service role. Please provide a unique name!")
                        return
                      }
                      cb()
                    }
                  }]}>
                    <Input
                      placeholder='Unique name for your service role'
                      disabled={roleName ? true : false} />
                  </Form.Item>
                  <FormItemLabel name='Role type' />
                  <Form.Item name='type' rules={[{ required: true, message: 'Please select role type' }]}>
                    <Select placeholder='Role type'>
                      <Select.Option value='project'>Project</Select.Option>
                      <Select.Option value='cluster'>Cluster</Select.Option>
                    </Select>
                  </Form.Item>
                  <ConditionalFormBlock dependency='type' condition={() => form.getFieldValue('type') === 'project'}>
                    <FormItemLabel name='Project ID' />
                    <Form.Item name='project' rules={[{ required: true, message: 'Please input project ID' }]}>
                      <Input placeholder='Project ID' />
                    </Form.Item>
                  </ConditionalFormBlock>
                  <FormItemLabel name='Service ID' />
                  <Form.Item name='service' rules={[{ required: true, message: 'Please input service ID' }]}>
                    <Input placeholder='Service ID' />
                  </Form.Item>
                  <FormItemLabel name="Rules" extra={<React.Fragment>
                    <Tooltip placement='top' title='Rules desrcibe the access to particular kubernetes resources'>
                      <QuestionCircleFilled style={{ marginLeft: '8px', fontSize: '14px' }} />
                    </Tooltip>
                    <Button style={{ float: 'right' }} onClick={onAddRuleClick}>Add rule</Button>
                  </React.Fragment>} />
                  <Table columns={ruleColumn} dataSource={rules} bordered pagination={false} />
                  <Button type='primary' style={{ width: '100%', marginTop: '24px' }} onClick={onSubmitServiceRole}>{roleName ? 'Save' : 'Add'}</Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
      {ruleModalVisible && <AddRuleForm
        initialValues={selectedRuleInfo}
        handleSubmit={handleRuleSubmit}
        handleCancel={handleRuleCancel} />}
    </React.Fragment>
  );
}

export default ServiceRoleForm;