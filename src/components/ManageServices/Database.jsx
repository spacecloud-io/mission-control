import React, { useState, useEffect } from 'react'
import postgresIcon from '../../assets/postgresIcon.svg'
import yb from '../../assets/yb.svg'
import StarterTemplate from '../../components/starter-template/StarterTemplate'
import { dbTypes } from '../../constants';
import { Row, Col, Button, Form, Input, Icon, Steps, Card, Select, Slider, InputNumber, Checkbox, Modal } from 'antd'


const Database = (props) => {

    const [selectedDB, setSelectedDB] = useState(dbTypes.POSTGRESQL);
    const [alias, setAlias] = useState("postgres");
    const [sliderValue, setSliderValue] = useState(25);
    const [check, setCheck] = useState(false);

    const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = props.form;
    const { Option } = Select;
    const projectName = getFieldValue("projectName");
    const projectID = projectName ? projectName.toLowerCase().replace(/\s+|-/g, '_') : "";
    const [projectId, setProjectId] = useState(projectID);

    const handlePostgres = () => {
        setSelectedDB(dbTypes.POSTGRESQL);
        setFieldsValue({
            alias: "postgres"
        });
    }
    return (
        <div>
            <Card>
                <center>Add a managed database to your project</center>
                <p>Select a database</p>
                <Row className="db-display">
                    <Col span={2}>
                        <StarterTemplate icon={postgresIcon} onClick={handlePostgres}
                            heading="POSTGRESQL"
                            recommended={false}
                            active={selectedDB === dbTypes.POSTGRESQL}
                            dbicon={yb}
                            db="Yugabyte DB" />
                    </Col>
                </Row>
                <p>Version</p>
                <Form.Item>
                    {getFieldDecorator('version', {
                        rules: [{ required: true, message: 'Please select a version' }],
                        initialValue: "1"
                    })(
                        <Select placeholder="Select a version" className="align-input">
                            <Option value="1">YB - 2.0.8 (Postgres - 11.2)</Option>
                        </Select>
                    )}
                </Form.Item>
                <p>Instance Type</p>
                <Form.Item>
                    {getFieldDecorator('instance_type', {
                        rules: [{ required: true, message: 'Please select instance type for the project' }],
                        initialValue: "1"
                    })(
                        <Select placeholder="Select instance type" className="align-input">
                            <Option value="1">1 vCPU / 2GB RAM</Option>
                            <Option value="2">2 vCPU / 4GB RAM</Option>
                            <Option value="3">4 vCPU / 8GB RAM</Option>
                            <Option value="4">6 vCPU / 16GB RAM</Option>
                        </Select>
                    )}
                </Form.Item>
                <p>Storage</p>
                <Form.Item>
                    <Slider
                        min={25}
                        max={16384}
                        tipFormatter={(value) => `${value} GB`}
                        defaultValue={25}
                        className="align-input slider-width"
                        style={{ float: "left" }}
                        onChange={(value) => setSliderValue(value)}
                        value={typeof sliderValue === 'number' ? sliderValue : 25}
                    />
                    <InputNumber
                        min={25}
                        max={16384}
                        formatter={value => `${value} GB`}
                        value={sliderValue}
                        className="slider-inputWidth"
                        onChange={(value) => setSliderValue(value)}
                    />
                </Form.Item>
                <Form.Item>
                    <Checkbox checked={check} onChange={e => setCheck(e.target.checked)}>Add Space Cloud to your project</Checkbox>
                </Form.Item>
                {check && (
                    <div>
                        <p style={{ marginBottom: 0, marginTop: 0 }}>Give your database an alias for Space Cloud</p>
                        <label style={{ fontSize: 12 }}>Alias is the name that you would use in your frontend to identify your database</label>
                        <Form.Item>
                            {getFieldDecorator('alias', {
                                rules: [{ required: true, message: 'Please input an alias for your database' }],
                                initialValue: alias
                            })(
                                <Input placeholder="eg: postgres" className="align-input" />,
                            )}
                        </Form.Item>
                    </div>
                )}
                <p>Replication Factor</p>
                <Form.Item>
                    {getFieldDecorator('replication_factor', {
                        rules: [{ required: true, message: 'Please select replication factor for the project' }],
                        initialValue: "1"
                    })(
                        <Select placeholder="Select replication factor" className="align-input">
                            <Option value="1">1</Option>
                            <Option value="3">3</Option>
                            <Option value="5">5</Option>
                        </Select>
                    )}
                </Form.Item>
                <p style={{ marginBottom: 0, marginTop: 0 }}>Instances</p>
                <label style={{ fontSize: 12 }}>Number of instances should always be more than that of replicas</label>
                <Form.Item>
                    {getFieldDecorator('instances', {
                        rules: [{ required: true, message: 'Please input an instances' }],
                        initialValue: "1"
                    })(
                        <InputNumber className="align-input" />,
                    )}
                </Form.Item>
                <p>Cluster</p>
                <Form.Item>
                    {getFieldDecorator('cluster', {
                        rules: [{ required: true, message: 'Please select cluster for the project' }],
                        initialValue: "cluster_1"
                    })(
                        <Select placeholder="Select cluster" mode="multiple" className="align-input">
                            <Option value="cluster_1">Cluster 1</Option>
                            <Option value="cluster_2">Cluster 2</Option>
                            <Option value="cluster_3">Cluster 3</Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item>
                    <Checkbox>Auto scale storage</Checkbox><br />
                    <Checkbox>Automatic backup</Checkbox>
                </Form.Item>
            </Card>
        </div>
    )
}

const WrappedCreateProject = Form.create({})(Database)

export default WrappedCreateProject;