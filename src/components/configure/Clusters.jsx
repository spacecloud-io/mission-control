import React, { useState } from 'react'
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, Input, Button } from 'antd';

const Cluster = ({ form }) => {
    const { getFieldDecorator } = form;
    const [selectedItems, setSelectedItems] = useState([]);
    const options = ['Cluster 1', 'Cluster 2', 'Cluster 3', 'Cluster 4'];
    const filteredOptions = options.filter(o => !selectedItems.includes(o));
    const handleChange = (items) => {
        setSelectedItems(items)
    }
    return (
        <div style={{ width: 800 }}>
            <Form>
                <Form.Item>
                    {getFieldDecorator('cluster', {
                        rules: [{ required: true, message: 'Please select cluster for the project' }],
                    })(
                        <Select
                            mode="multiple"
                            placeholder="Select Clusters"
                            value={selectedItems}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        >
                            {filteredOptions.map(item => (
                                <Select.Option key={item} value={item}>
                                    {item}
                                </Select.Option>
                            ))}
                        </Select>
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

export default Form.create({})(Cluster);