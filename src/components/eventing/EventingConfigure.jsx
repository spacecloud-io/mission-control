import React from 'react'
import { useParams } from "react-router-dom";
import { AutoComplete, Button, Form, Checkbox, Input, Alert } from 'antd';
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import FormItemLabel from "../form-item-label/FormItemLabel";


const EventingConfigure = ({ initialValues, handleSubmit, dbList, loading }) => {

	const { projectID } = useParams()

	const [form] = Form.useForm()
	const handleSubmitClick = e => {
		form.validateFields().then(values => {
			const { enabled, dbAlias, conn } = values;
			const config = {
				enabled,
				dbAlias,
				broker: {
					type: "rabbitmq",
					conn
				}
			}
			handleSubmit(config)
		})
	}

	const conn = initialValues.broker && initialValues.broker.conn ? initialValues.broker.conn : "rabbitmq.space-cloud.svc.cluster.local:6379"

	if (!loading) {
		form.setFieldsValue({ conn, ...initialValues })
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
				<Form.Item name="conn">
					<Input placeholder="Provide connection string of Rabbit MQ" style={{ maxWidth: 800 }} />
				</Form.Item>
				<Alert
					message={<span>Space Cloud has a Rabbit MQ add-on that you can use here. You can configure it from the <a href={`/mission-control/projects/${projectID}/settings/add-ons`} style={{ color: '#7EC6FF' }}>add-ons page</a>.</span>}
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