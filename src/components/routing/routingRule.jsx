import React, { useState } from 'react'
import { Modal, Form, Input, Select, Checkbox } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const RoutingRule = (props) => {
    const { getFieldDecorator, getFieldValue } = props.form;
    const { source, dest } = props.initialValues ? props.initialValues : {}
    const children = [];
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

    const handleSubmitClick = e => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            if (!err) {
                if(!props.initialValues){
                    props.handleSubmit(getFieldValue("routeType"), getFieldValue("URL"), 
                    getFieldValue("prefix"), getFieldValue("Service"), getFieldValue("port"), 
                    getFieldValue("Rewrite URL"), getFieldValue("Allow hosts"));
                }else{
                    props.handleUpdate(getFieldValue("routeType"), getFieldValue("URL"), 
                    getFieldValue("prefix"), getFieldValue("Service"), getFieldValue("port"), 
                    getFieldValue("Rewrite URL"), getFieldValue("Allow hosts"))
                }
                props.handleCancel();
                props.form.resetFields();
            }
            
        });
    };

    return (
        <div>
            <Modal
                title={`${props.initialValues ? "Edit" : "Add"} Routing Rules`}
                visible={true}
                okText={props.initialValues ? "Save" : "Add"}
                onCancel={props.handleCancel}
                onOk={handleSubmitClick}
            >
                <Form layout="vertical" onSubmit={handleSubmitClick}>
                    <FormItemLabel name="Route matching type" />
                    <Form.Item>
                        {getFieldDecorator('routeType', {
                            rules: [{ required: true, message: 'Route type is required' }],
                            initialValue: (source && source.type) ? source.type : "prefix" 
                        })(
                            <Select style={{ width: 200 }} >
                                <Select.Option value="prefix">Prefix Match</Select.Option>
                                <Select.Option value="exact">Exact Match</Select.Option>
                            </Select>
                        )}
                    </Form.Item>
                    {getFieldValue('routeType') === "exact" ? (
                        <div>
                            <FormItemLabel name="URL" />
                            <Form.Item>
                                {getFieldDecorator('URL', {
                                    rules: [{ required: true, message: 'Please provide URL' }],
                                    initialValue: (source && source.url) ? source.url : ""
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
                                        rules: [{ required: true, message: 'Please provide prefix' }],
                                        initialValue: (source && source.url) ? source.url.split('*', 1) : ""
                                    })(
                                        <Input placeholder="Prefix for incoming request (eg:/v1/)" />
                                    )}
                                </Form.Item>
                            </div>
                        )}
                    <FormItemLabel name="Target Service" />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Form.Item>
                            {getFieldDecorator('Service', {
                                rules: [{ required: true, message: 'Please provide service' }],
                                initialValue: (dest && dest.host) ? dest.host.split('.', 1) : ""
                            })(

                                <Select style={{ width: 300 }} placeholder="Service a Service">
                                    {serviceObj.map(data => (
                                        <Select.Option value={data.name}>{data.name}</Select.Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('port', {
                                rules: [{ required: true, message: 'Please select port' }],
                                initialValue: (dest && dest.port) ? dest.port : ""
                            })(
                                <Select style={{ width: 150 }} placeholder="Select Port">
                                    {serviceObj.map(data => (
                                        data.name === getFieldValue('Service') ? (
                                            data.port.map(data => (
                                                <Select.Option value={data}>{data}</Select.Option>
                                            ))
                                        ) : ("")
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    </div>
                    <FormItemLabel name="Rewrite" />
                    <Form.Item>
                        {getFieldDecorator('Rewrite', {
                            valuePropName: 'checked',
                            initialValue: (source && source.rewrite) ? true: false,
                        })(<Checkbox>Rewrite incoming request URL to target service</Checkbox>)}
                    </Form.Item>
                    {getFieldValue('Rewrite') ? (
                        <div>
                            <FormItemLabel name="Rewrite URL" />
                            <Form.Item>
                                {getFieldDecorator('Rewrite URL', {
                                    rules: [{ required: true, message: 'Please provide URL' }],
                                    initialValue: (source && source.rewrite) ? source.rewrite : ""
                                })(
                                    <Input placeholder="New Request URL that will override the incoming request " />
                                )}
                            </Form.Item>
                        </div>
                    ) : ("")}
                    <FormItemLabel name="Hosts" />
                    <Form.Item>
                        {getFieldDecorator('Hosts', {
                            valuePropName: 'checked',
                            initialValue: (source && source.hosts) ? true: false,
                        })(<Checkbox>Allow traffic from specified hosts only</Checkbox>)}
                    </Form.Item>
                    {getFieldValue('Hosts') ? (
                        <div>
                            <FormItemLabel name="Allowed hosts " />
                            <Form.Item>
                                {getFieldDecorator('Allow hosts', {
                                rules: [{ required: true, message: 'Please enter the domain for the project' }],
                                initialValue: (source && source.hosts) ? source.hosts : ""
                                })(
                                    <Select mode="tags" placeholder="Add hosts that you want to allow for this route" style={{ width: '100%' }} tokenSeparators={[',']}>
                                        {children}
                                    </Select>,
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