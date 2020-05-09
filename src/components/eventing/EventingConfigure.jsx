import React from 'react'
import { Select, Button, Form } from 'antd';


const EventingConfigure = ({ dbType, handleSubmit, dbList }) => {
	const [form] = Form.useForm()
	const handleSubmitClick = e => {
		form.validateFields().then(values => {
			handleSubmit(values.dbType);
		})
	}

	form.setFieldsValue({ dbType })
	return (
		<div>
			<p>The database and table/collection used by Space Cloud to store event logs</p>
			<Form layout="inline" form={form} >
				<Form.Item name="dbType" rules={[{ required: true, message: 'Database is required!' }]}>
					<Select placeholder="Database" style={{ minWidth: 200 }}>
						{dbList.map((db) => (
							<Select.Option value={db.alias} ><img src={db.svgIconSet} style={{ marginRight: 10 }} />{db.alias}</Select.Option>
						))}
					</Select>
				</Form.Item>
				<br />
				<Form.Item>
					<Button onClick={handleSubmitClick} >
						Save
          </Button>
				</Form.Item>
			</Form>
		</div>
	)
}

export default EventingConfigure;