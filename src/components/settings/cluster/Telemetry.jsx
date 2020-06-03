import React from "react";
import { Form, Input, Switch } from 'antd';

const Telemetry = ({ loading, telemetry, handleSubmit }) => {
  const [form] = Form.useForm();
  if (!loading) {
    form.setFieldsValue({ telemetry })
  }

  const handleSubmitClick = values => handleSubmit(values);

  return(
    <React.Fragment>
    <h2>Telemetry</h2>
    <p>Enable collection of anonymous metrics to improve Space Cloud</p>
    <Form form={form} initialValues={{ telemetry }} onFinish={handleSubmitClick}>
      <Form.Item shouldUpdate={(prev, curr) => prev.telemetry !== curr.telemetry}>
        <Switch checked={telemetry} onChange={() => handleSubmit(!telemetry)} />
      </Form.Item>
    </Form>
    </React.Fragment>
  );
}

export default Telemetry;
