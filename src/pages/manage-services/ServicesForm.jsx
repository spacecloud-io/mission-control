import React, {useState} from 'react';
import './services-form.css';
import { useParams ,useHistory } from "react-router-dom"
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import FormItemLabel from "../../components/form-item-label/FormItemLabel";
import ServiceTemplate from "../../components/service-template/ServiceTemplate";
import postgresIcon from "../../assets/postgresIcon.svg";
import spaceupIcon from "../../assets/spaceup.png";
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
         Checkbox } from "antd";
const { Option } = Select;

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
      Add a service
    </span>
  </div>
}

const ManagedServices = (props) => {
  const [sliderValue, setSliderValue] = useState(25);
  const [selectedService, setSelectedService] = useState("postgres");
  const { projectID } = useParams()
  const { getFieldDecorator, getFieldValue } = props.form;

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  };

  const sliderOnChange = e => {
    setSliderValue(e)
  }

	return (
		<div className="configure-page">
			<Topbar showProjectSelector />
			<div>
				<Sidenav selectedItem="manage-services" />
				<div className="page-content page-content--no-padding">
          <ServiceTopBar projectID={projectID} />
          <Row style={{margin: "56px 0"}}>
          <Col lg={{ span: 18, offset: 3 }} sm={{ span: 24 }} >
          <Card>
            <div style={{fontWeight: "bold", textAlign: "center", marginBottom: 25}}>Add a managed service to your project</div>
            <Form onSubmit={handleSubmit} layout="vertical" style={{marginLeft: "5%", marginRight: "5%"}}>
              <FormItemLabel name="Select a service" />
                <Form.Item>
                  {getFieldDecorator('service', {
                    rules: [{ required: true, message: 'Please select a service!' }],
                    initialValue: "postgres"
                  })(
                    <Radio.Group onChange={e => setSelectedService(e.target.value)}>
                      <Radio.Button className="radio-card" value="postgres" style={{padding: 0}}>
                      <ServiceTemplate icon={postgresIcon}
                        heading="PostgreSQL" 
                        recommended={false}
                        active={selectedService === "postgres"}
                      />
                      </Radio.Button>
                      <Radio.Button className="radio-card" value="spacecloud">
                      <ServiceTemplate icon={spaceupIcon}
                        heading="Space Cloud" 
                        recommended={false}
                        active={selectedService === "spacecloud"} 
                      />
                      </Radio.Button>
                    </Radio.Group>
                  )}
                </Form.Item>
                <FormItemLabel name="Version"/>
                <Form.Item>
                  {getFieldDecorator('version', {
                    rules: [{ required: true, message: 'Please select version!' }],
                  })(
                    <Select placeholder="Select version" style={{width: 230}}>
                      <Option value="1">Version 1</Option>
                      <Option value="2">Version 2</Option>
                      <Option value="3">Version 3</Option>
                    </Select>
                  )}
                </Form.Item>
                <FormItemLabel name="Instance Type" />
                <Form.Item>
                  {getFieldDecorator('instance-type', {
                    rules: [{ required: true, message: 'Please select instance type!' }],
                  })(
                    <Select placeholder="Select version" style={{width: 230}}>
                      <Option value="1">Version 1</Option>
                      <Option value="2">Version 2</Option>
                      <Option value="3">Version 3</Option>
                    </Select>
                  )}
                </Form.Item>
                {getFieldValue("service") === "postgres" && (
                  <>
                  <FormItemLabel name="Storage" />
                  <Form.Item>
                    {getFieldDecorator('storage', {
                      
                    })(
                      <Row>
                        <Col span={8}>
                        <Slider
                          min={25}
                          max={16000}
                          onChange={sliderOnChange}
                          value={sliderValue}
                          step={1}
                          />
                        </Col>
                        <Col span={2}>
                          <InputNumber
                            min={25}
                            max={16000}
                            style={{ marginLeft: 16 }}
                            step={1}
                            value={sliderValue}
                            onChange={sliderOnChange}
                          />
                        </Col>
                      </Row>
                    )}
                  </Form.Item>
                  </>
                )}
                <FormItemLabel name="Name" />
                <Form.Item>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: 'Please input name!' }],
                  })(
                    <Input placeholder="Name your service" style={{width: 230}}/>
                  )}
                </Form.Item>
                {getFieldValue("service") === "postgres" && (
                  <>
                  <Form.Item>
                  {getFieldDecorator('add_spacecloud', {
                  })(
                    <Checkbox>Add SpaceCloud to your project</Checkbox>
                  )}
                  </Form.Item>
                  <FormItemLabel 
                  name="Give your database an alias for space cloud"
                  description="Alias is the name that you would use in your frontend to identify your database"
                  />
                  <Form.Item>
                    {getFieldDecorator('alias', {
                      rules: [{ required: true, message: 'Please input alias!' }],
                      initialValue: "postgres"
                    })(
                      <Input style={{width: 230}}/>
                    )}
                  </Form.Item>
                  <FormItemLabel name="Replication factor" />
                    <Form.Item>
                    {getFieldDecorator('instance-type', {
                      rules: [{ required: true, message: 'Please select replication factor' }],
                    })(
                    <Select placeholder="Select replicas" style={{width: 230}}>
                      <Option value="1">replica 1</Option>
                      <Option value="2">replica 2</Option>
                      <Option value="3">replica 3</Option>
                    </Select>
                    )}
                  </Form.Item>
                  <FormItemLabel 
                  name="Instances"
                  description="Number of instances should be more than that of replicas"
                  />
                  <Form.Item>
                    {getFieldDecorator('instances', {
                      rules: [{ required: true, message: 'Please input instances!' }],
                    })(
                      <Input style={{width: 230}}/>
                    )}
                  </Form.Item>
                  </>
                )}    
                <FormItemLabel name="Clusters" />
                <Form.Item>
                  {getFieldDecorator('clusters', {
                    rules: [{ required: true, message: 'Please select clusters!' }],
                  })(
                    <Select placeholder="Your clusters" style={{width: 230}}>
                      <Option value="1">Version 1</Option>
                      <Option value="2">Version 2</Option>
                      <Option value="3">Version 3</Option>
                    </Select>
                  )}
                </Form.Item>
                {getFieldValue("service") === "postgres" && (
                  <>
                  <Form.Item>
                  {getFieldDecorator('auto_scale', {
                  })(
                    <Checkbox>Auto Scale Merge</Checkbox>
                  )}
                  </Form.Item>
                  <Form.Item>
                  {getFieldDecorator('automatic_backup', {
                  })(
                    <Checkbox>Automatic Backup</Checkbox>
                  )}
                  </Form.Item>
                  </>
                )}
                {getFieldValue("service") === "spacecloud" && (
                  <>
                <FormItemLabel name="Minimum Value" />
                <Form.Item>
                  {getFieldDecorator('minimum-value', {
                    rules: [{ required: true, message: 'Please input minimum value!' }],
                  })(
                    <Input placeholder="Minimum value" style={{width: 230}}/>
                  )}
                </Form.Item>
                <FormItemLabel name="Maximum value" />
                <Form.Item>
                  {getFieldDecorator('maximum-value', {
                    rules: [{ required: true, message: 'Please input maximum value!' }],
                  })(
                    <Input placeholder="Maximum value" style={{width: 230}}/>
                  )}
                </Form.Item>
                </>
                )}
                <Button type="primary" className="db-btn" htmlType="submit">Add service</Button>
            </Form>
          </Card>
          </Col>
          </Row>
				</div>
			</div>
		</div>
	);
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(ManagedServices);

export default WrappedNormalLoginForm;
