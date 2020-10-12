import React, { useState } from "react"
import { Modal, Card, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import jwt from 'jsonwebtoken';
import { notify, generateToken } from "../../../utils";
import { useSelector } from "react-redux";
import JSONCodeMirror from "../../json-code-mirror/JSONCodeMirror";

const GenerateTokenForm = (props) => {
  const [form] = Form.useForm();
  const decodedClaims = jwt.decode(props.initialToken)
  const initialPayload = decodedClaims ? decodedClaims : {}

  const [data, setData] = useState(JSON.stringify(initialPayload, null, 2))
  const generatedToken = useSelector(state => generateToken(state, props.projectID, data))
  const handleSubmit = e => {
    form.validateFields().then(values => {
      try {
        JSON.parse(data)
        props.handleSubmit(generatedToken);
        props.handleCancel();
      } catch (ex) {
        notify("error", "Error", ex.toString())
      }
    });
  };

  return (
    <Modal
      title="Generate token"
      visible={true}
      width={720}
      okText="Use this token"
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <FormItemLabel name="Token claims" />
        <JSONCodeMirror value={data} onChange={value => setData(value)} options={{ autofocus: true }} />
        <div style={{ paddingTop: 16 }}>
          <FormItemLabel name="Generated token" />
          <Card bodyStyle={{ backgroundColor: "#F2F2F2" }}>
            <h4>{generatedToken}</h4>
          </Card>
        </div>
      </Form>
    </Modal>
  )
}

export default GenerateTokenForm