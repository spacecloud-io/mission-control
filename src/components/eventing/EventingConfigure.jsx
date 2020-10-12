import React from 'react'
import { AutoComplete, Button, Form, Checkbox, Input, Alert } from 'antd';
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import FormItemLabel from "../form-item-label/FormItemLabel";


const EventingConfigure = ({ initialValues, handleSubmit, dbList, loading }) => {
	const [form] = Form.useForm()
	const handleSubmitClick = e => {
		form.validateFields().then(values => {
			handleSubmit(values);
		})
	}

	if (!loading) {
		form.setFieldsValue(initialValues)
	}

	return (
		<Form form={form} >
			<Form.Item name="enabled" valuePropName="checked">
				<Checkbox>
					Enable eventing module
        		</Checkbox>
			</Form.Item>
			<ConditionalFormBlock dependency="enabled" condition={() => form.getFieldValue("enabled")}>
				<FormItemLabel name="Eventing DB" description="Alias name is used in your frontend queries to identify your database" />
				<Form.Item name="dbAlias" rules={[{ required: true, message: 'Database is required!' }]}>
					<AutoComplete placeholder="Choose an eventing database" style={{ width: 320 }} options={dbList.map(db => ({ value: db }))} />
				</Form.Item>
				<FormItemLabel name="Rabbit MQ connection string" />
				<Form.Item name="rabbit">
					<Input placeholder="Provide connection string of Rabbit MQ" style={{ maxWidth: 800 }} />
				</Form.Item>
				<Alert
					message="Space Cloud has a Rabbit MQ add-on that you can use here. You can configure it from the cluster settings."
					type="info"
					showIcon
					style={{ maxWidth: 800, marginBottom: 24 }}
				/>
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