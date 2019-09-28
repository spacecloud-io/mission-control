import React from 'react';
import './configure.css';
import { Form, Input, Select, Switch } from 'antd';
import { createFormField } from 'rc-form';
const { Option } = Select;

function EventingConfigure(props) {
	const { getFieldDecorator } = props.form;
	return (
		<div className="configure">
			<div className="conn-string">Eventing : </div>

			<Form className="conn-form" layout="inline">
				<div className="conn-form-options">
					<Form.Item>
						{getFieldDecorator('dbType', {
							rules: [ { required: true, message: '' } ]
						})(
							<Select placeholder="Database" className="select">
								<Option value="mongo">MongoDB</Option>
								<Option value="sql-postgres">PostgreSQL</Option>
								<Option value="sql-mysql">MySQL</Option>
							</Select>
						)}
					</Form.Item>
					<Form.Item label="Enabled" className="switch">
						{getFieldDecorator('enabled', { valuePropName: 'checked' })(<Switch size="small" />)}
					</Form.Item>
				</div>
				<div className="conn-form-cert">
					<Form.Item className="conn-form-cert-input">
						{getFieldDecorator('col', {
							rules: [ { required: true, message: '' } ]
						})(<Input style={{ width: 600 }} placeholder="Enter collection name where event logs should be stored" />)}
					</Form.Item>
				</div>
			</Form>
		</div>
	);
}

const WrappedEventingConfigureForm = Form.create({
	mapPropsToFields(props) {
		return {
			enabled: createFormField({ value: props.formState.enabled }),
			dbType: createFormField({ value: props.formState.dbType }),
			col: createFormField({ value: props.formState.col })
		};
	},
	onValuesChange(props, changedValues) {
		props.handleChange(changedValues);
	}
})(EventingConfigure);

export default WrappedEventingConfigureForm;
