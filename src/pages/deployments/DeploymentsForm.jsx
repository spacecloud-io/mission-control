import React, {useState} from 'react';
import './deployments-form.css';
import { useParams ,useHistory } from "react-router-dom"
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import AdvancedForm from '../../components/deployment/AdvancedForm';
import FormItemLabel from "../../components/form-item-label/FormItemLabel";
import Undraw from "../../assets/undraw_deployment.png";
import { Icon, 
         Form, 
         Select, 
         Button, 
         Input, 
         Card, 
         Row, 
         Col, 
         Radio, 
         Slider, 
         InputNumber,
         Tabs,
         Collapse, 
         Checkbox } from "antd";
const { Option } = Select;
const {TabPane} = Tabs;
const {Panel} = Collapse;

const ServiceTopBar = ({ projectID }) => {
  const history = useHistory()

  return <div style={{
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
    height: 48,
    lineHeight: 48,
    zIndex: 98,
    display: "flex",
    alignItems: "center",
    padding: "0 16px"
  }}>
    <Button type="link" onClick={() => history.goBack()}>
      <Icon type="left" />
      Go back
      </Button>
    <span style={{ marginLeft: 16, fontWeight: "bold" }}>
      Add deployment
    </span>
  </div>
}

let ports = 1;
const Deployment = (props) => {
  const { projectID } = useParams()
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  };

  const remove = k => {
    const keys = getFieldValue("keys");
    if (keys.length === 1) {
      return;
    }

    setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  const add = (id) => {
    if(getFieldValue(`ports[${id}].port`)){
      const keys = getFieldValue("keys");
      const nextKeys = keys.concat(ports++);
      setFieldsValue({
        keys: nextKeys
      });
    }
    else{
      alert("You need to fill current fields before adding new")
    }
  };

  const initialKeys = [0];

  getFieldDecorator("keys", { initialValue: initialKeys });
  const keys = getFieldValue("keys");
  const formItemsPorts = keys.map((k, index) => (
    <Row key={k}>
      <Col span={5}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`ports[${k}].protocol`, {
            initialValue: "http"
          })(<Select style={{width: "100"}}>
            <Option value="http">HTTP</Option>
          </Select>)}
        </Form.Item>
      </Col>
      <Col span={5}>
        <Form.Item style={{marginLeft: -40, marginRight: 30}}>
          {getFieldDecorator(`ports[${k}].port`, {})
          (<Input placeholder="Port. Eg: 8080" />)}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index === keys.length - 1 && (
          <Button onClick={() => add(index)}>
            <Icon type="plus" />Add
          </Button>
        )}
        {index !== keys.length - 1 && (
          <Button onClick={() => remove(k)}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));

	return (
		<div className="configure-page">
			<Topbar showProjectSelector />
			<div>
				<Sidenav selectedItem="deployments" />
				<div className="page-content page-content--no-padding">
          <ServiceTopBar projectID={projectID} />
          <Row style={{margin: "56px 0"}}>
            <Col lg={{ span: 18, offset: 3 }} sm={{ span: 24 }} >
              <Card>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Code" key="1">
                    <div style={{textAlign: 'center', marginTop: 73}}>
                      <img src={Undraw} alt="undraw" style={{height: 200}}/>
                      <p style={{marginTop: 78, fontWeight: 500}}>
                      Deploy your code to Galaxy from your laptop easily in minutes
                      <br/><br/>
                      <a style={{color: "#40A9FF", fontSize: 14}}>Follow the instructions here <Icon type="link" /></a>
                      </p>
                    </div>
                  </TabPane>
                  <TabPane tab="Image" key="2">
                    <Form onSubmit={handleSubmit} layout="vertical" style={{marginLeft: "5%", marginRight: "5%"}}>
                      <FormItemLabel name="Name" />
                      <Form.Item>
                      {getFieldDecorator('service_name', {
                        rules: [{ required: true, message: 'Please name your service!' }]
                      })(
                        <Input placeholder="Name your service" style={{width: 230}}/>
                        )}
                      </Form.Item>
                      <FormItemLabel name="Docker container" />
                      <Form.Item>
                      {getFieldDecorator('docker_container', {
                        rules: [{ required: true, message: 'Please input docker container!' }]
                      })(
                        <Input placeholder="eg: spaceuptech/space-cloud:v0.15.0" style={{width: 600}}/>
                        )}
                      </Form.Item>
                      <FormItemLabel name="Ports" />
                      {formItemsPorts}
                      <FormItemLabel name="Resources" />
                      <Form.Item>
                        {getFieldDecorator('resouces', {
                          initialValue: "0.25"
                        })(
                          <Select style={{width: 250}}>
                            <Option value="0.25">0.25 vCPU / 0.5 GB Ram</Option>
                          </Select>
                        )}
                      </Form.Item>
                      <FormItemLabel name="Auto scaling" description="Auto scale your container instances between min and max replicas based on the number of requests" />
                      <Form.Item>
                        <>
                        {getFieldDecorator("min", {initialValue: 0})(
                           <Input addonBefore="Min" style={{width: 147}}/>
                        )}
                        {getFieldDecorator("max", {initialValue: 100})(
                           <Input addonBefore="Max" style={{width: 147, marginLeft: 35}}/>
                        )}
                        </>
                      </Form.Item>
                      <FormItemLabel name="Concurrency" description="Number of requests that your single instance can handle parallely" />
                      <Form.Item>
                        {getFieldDecorator("concurrency", {initialValue: 50})(
                          <InputNumber style={{width: 230}}/>
                        )}
                      </Form.Item>
                      <Collapse bordered={false}>
                        <Panel header="Advanced" key="1">
                          <AdvancedForm />
                        </Panel>
                      </Collapse>
                      <Button type="primary" className="db-btn" htmlType="submit">Add deployment</Button>
                    </Form>
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
				</div>
			</div>
		</div>
	);
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(Deployment);

export default WrappedNormalLoginForm;
