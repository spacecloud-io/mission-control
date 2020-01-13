import React, { useState } from 'react'
import { Modal, Form, Input, Select, Checkbox } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const RoutingRule = (props) => {
    const { getFieldDecorator } = props.form;

    const [rewriteCheck, setRewriteCheck] = useState(false);
    const [hostCheck, setHostCheck] = useState(false);
    const [routeType, setRouteType] = useState("Prefix_Match")
    const [targetService, setTargetService] = useState("")

    const onChange = (type) => {
        if (type === "host") setHostCheck(!hostCheck)
        if (type === "write") setRewriteCheck(!rewriteCheck)
    }

    const selectedRouteType = (value) => {
        setRouteType(value)
    }

    const targetServices = (value) => {
        setTargetService(value)
    }

    const serviceObj = [
        {
            name: "service1",
            port: ["port1", "port2", "port3"]
        },
        {
            name: "service2",
            port: ["port4", "port5", "port6"]
        },
        {
            name: "service3",
            port: ["port7", "port8", "port9"]
        },
    ]

    return (
        <div>
            <Modal
                title="Add routing rule"
                visible={true}
                okText="Add"
                onCancel={props.handleCancel}
            //onOk={handleSubmit}
            >
                <Form layout="vertical">
                    <FormItemLabel name="Route matching type" />
                    <Form.Item>
                        {getFieldDecorator('routeType', {
                            rules: [{ required: true, message: 'Route type is required' }],
                            initialValue: "Prefix_Match"
                        })(
                            <Select style={{ width: 200 }} onChange={selectedRouteType}>
                                <Select.Option value="Prefix_Match">Prefix Match</Select.Option>
                                <Select.Option value="Exact_Match">Exact Match</Select.Option>
                            </Select>
                        )}
                    </Form.Item>
                    {routeType === "Exact_Match" ? (
                        <div>
                            <FormItemLabel name="URL" />
                            <Form.Item>
                                {getFieldDecorator('URL', {
                                    rules: [{ required: true, message: 'Please provide URL' }]
                                })(
                                    <Input placeholder="The exact URL of incoming request (eg:/v1/foo/bar)" />
                                )}
                            </Form.Item>
                        </div>
                    ) : (
                            <div>
                                <FormItemLabel name="Prefix" />
                                <Form.Item>
                                    {getFieldDecorator('prefix', {
                                        rules: [{ required: true, message: 'Please provide prefix' }]
                                    })(
                                        <Input placeholder="Prefix for incoming request (eg:/v1/)" />
                                    )}
                                </Form.Item>
                            </div>
                        )}
                    <FormItemLabel name="Target Service" />
                    <Form.Item>
                        {getFieldDecorator('Service', {
                            rules: [{ required: true, message: 'Please provide service' }]
                        })(
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <Select style={{ width: 300 }} placeholder="Service a Service" onChange={targetServices}>
                                    {serviceObj.map(data => (
                                        <Select.Option value={data.name}>{data.name}</Select.Option>
                                    ))}
                                </Select>
                                <Select style={{ width: 150 }} placeholder="Select Port">
                                    {serviceObj.map(data => (
                                        data.name === targetService ? (
                                            data.port.map(data => (
                                                <Select.Option value={data}>{data}</Select.Option>
                                            ))
                                        ) : ("")
                                    ))}
                                </Select>
                            </div>
                        )}
                    </Form.Item>
                    <FormItemLabel name="Rewrite" />
                    <Form.Item>
                        <Checkbox checked={rewriteCheck} onChange={(e) => onChange("write")} >Rewrite incoming request URL to target service</Checkbox>
                    </Form.Item>
                    {rewriteCheck ? (
                        <div>
                            <FormItemLabel name="Rewrite URL" />
                            <Form.Item>
                                {getFieldDecorator('Rewrite URL', {
                                    rules: [{ required: true, message: 'Please provide URL' }]
                                })(
                                    <Input placeholder="New Request URL that will override the incoming request " />
                                )}
                            </Form.Item>
                        </div>
                    ) : ("")}
                    <FormItemLabel name="Hosts" />
                    <Form.Item>
                        <Checkbox checked={hostCheck} onChange={(e) => onChange("host")} >Allow traffic from specified host only</Checkbox>
                    </Form.Item>
                    {hostCheck ? (
                        <div>
                            <FormItemLabel name="Allowed hosts " />
                            <Form.Item>
                                {getFieldDecorator('Allow hosts', {
                                    rules: [{ required: true, message: 'Please provide hosts' }]
                                })(
                                    <Input placeholder="Add hosts that you want to allow for this route" />
                                )}
                            </Form.Item>
                        </div>
                    ) : ("")}
                </Form>
            </Modal>

        </div>
    )
}

export default Form.create({})(RoutingRule)