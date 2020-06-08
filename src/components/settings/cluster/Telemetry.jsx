import React from "react";
import { Form, Switch } from 'antd';

const Telemetry = ({ loading, telemetry, handleSubmit }) => {
  const [form] = Form.useForm();
  if (!loading) {
    form.setFieldsValue({ telemetry })
  }

  return(
    <React.Fragment>
    <h2>Telemetry</h2>
    <p>Enable collection of anonymous metrics to improve Space Cloud</p>
    <Switch checked={telemetry} onChange={() => handleSubmit(!telemetry)} />
    </React.Fragment>
  );
}

export default Telemetry;
