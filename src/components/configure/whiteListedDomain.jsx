import React, { useState } from 'react'
import { Form, Select, Input, Button, Alert } from 'antd';


const WhiteListedDomains = ({ form }) => {
    const { getFieldDecorator } = form;
    const { Option } = Select;
    const children = [];
    for (let i = 10; i < 36; i++) {
        children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }

    return (
        <div style={{ width: 800 }}>
            <Alert
                message="Domain setup"
                description="Make sure you have added A/AAA records pointing these domains to the clusters in this environment."
                type="info"
                showIcon
            />
            <Form style={{ paddingTop: 10 }}>
                <Form.Item>
                    {getFieldDecorator('cluster', {
                        rules: [{ required: true, message: 'Please enter the domain for the project' }],
                    })(
                        <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
                            {children}
                        </Select>,
                    )}
                </Form.Item>
                <Form.Item>
                    <Button>
                        Save
                     </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default Form.create({})(WhiteListedDomains);