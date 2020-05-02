import React from 'react'
import { Form, Select, Input, Button } from 'antd';


const { Option } = Select;

const EventingConfigure = ({ form, dbType, handleSubmit, dbList }) => {
	const { getFieldDecorator } = form;

	const handleSubmitClick = e => {
		e.preventDefault();
		form.validateFields((err, values) => {
			if (!err) {
				handleSubmit(values.dbType);
			}
		});
	}

	return (
		<div>
			<p>The database and table/collection used by Space Cloud to store event logs</p>
			<Form layout="inline">
				<Form.Item>
					{getFieldDecorator('dbType', {
						rules: [{ required: true, message: 'Database is required!' }],
						initialValue: dbType
					})(
						<Select placeholder="Database" style={{ minWidth: 200 }}>
							{dbList.map((db) => (
								<Select.Option value={db.alias} ><img src={db.svgIconSet} style={{ marginRight: 10 }} />{db.alias}</Select.Option>
							))}
						</Select>
					)}
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

export default Form.create({})(EventingConfigure);