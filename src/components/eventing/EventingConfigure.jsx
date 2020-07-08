import React from 'react'
import { Select, Button, Form, Checkbox } from 'antd';
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";


const EventingConfigure = ({ initialValues, handleSubmit, dbList }) => {
	const [form] = Form.useForm()
	const handleSubmitClick = e => {
		form.validateFields().then(values => {
			handleSubmit(values);
		})
	}

	form.setFieldsValue(initialValues)
	return (
		<Form form={form} >
			<Form.Item name="enabled" valuePropName="checked">
				<Checkbox>
					Enable eventing module
        </Checkbox>
			</Form.Item>
			<ConditionalFormBlock dependency="enabled" condition={() => form.getFieldValue("enabled")}>
				<Form.Item name="dbAlias" rules={[{ required: true, message: 'Database is required!' }]}>
					<Select placeholder="Choose an eventing database" style={{ width: 320 }} allowClear>
						{dbList.map((db) => (
							<Select.Option value={db.alias} ><img src={db.svgIconSet} style={{ marginRight: 10 }} />{db.alias}</Select.Option>
						))}
					</Select>
				</Form.Item>
			</ConditionalFormBlock>
			<Form.Item>
				<Button onClick={handleSubmitClick} >
					Save
			</Button>
			</Form.Item>
		</Form>
	)
}

export default EventingConfigure;