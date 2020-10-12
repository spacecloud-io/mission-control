import React from "react"
import { Modal, Card, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import jwt from 'jsonwebtoken';
import { notify, generateToken } from "../../../utils";
import JSONCodeMirror from "../../json-code-mirror/JSONCodeMirror";
import store from "../../../store";

const getToken = (claims, projectId) => {
  return generateToken(store.getState(), projectId, claims)
}

const GenerateTokenForm = (props) => {
  const [form] = Form.useForm();
  const decodedClaims = jwt.decode(props.initialToken)
  const initialPayload = decodedClaims ? decodedClaims : {}
  const formInitialValues = {
    claims: JSON.stringify(initialPayload, null, 2)
  }

  const handleSubmit = e => {
    form.validateFields().then(values => {
      try {
        JSON.parse(values.claims)
        props.handleSubmit(getToken(values.claims, props.projectID));
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
      <Form form={form} layout="vertical" initialValues={formInitialValues}>
        <FormItemLabel name="Token claims" />
        <Form.Item name="claims">
          <JSONCodeMirror options={{ autofocus: true }} />
        </Form.Item>
        <Form.Item shouldUpdate={true}>
          {() => {
            const claims = form.getFieldValue("claims")
            const generatedToken = getToken(claims, props.projectID)
            return (
              <React.Fragment>
                <FormItemLabel name="Generated token" />
                <Card bodyStyle={{ backgroundColor: "#F2F2F2" }}>
                  <h4>{generatedToken}</h4>
                </Card>
              </React.Fragment>
            )
          }}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default GenerateTokenForm