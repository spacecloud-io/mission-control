import React from "react";
import { Form, Select, Button, Alert } from "antd";

const WhiteListedDomains = ({ loading, domains, handleSubmit }) => {
  const [form] = Form.useForm();
  if (!loading) {
    form.setFieldsValue({ domains })
  }
  const handleSubmitClick = values => handleSubmit(values.domains)

  return (
    <div>
      <h2>Whitelisted Domains</h2>
      <p>
        Add domains you want to whitelist for this project. Space cloud will
        automatically add and renew SSL certificates for these domains
      </p>
      <Alert
        message="Domain setup"
        description="Make sure you have added A/AAA records pointing these domains to the clusters in this environment."
        type="info"
        showIcon
      />
      <Form form={form} style={{ paddingTop: 10 }} initialValues={{ domains: domains ? domains : [] }} onFinish={handleSubmitClick}>
        <Form.Item name="domains">
          <Select
            mode="tags"
            placeholder="Example: foo.bar.com"
            style={{ width: "100%" }}
            tokenSeparators={[","]}
          >
          </Select>
        </Form.Item>
        <Form.Item shouldUpdate={(prev, curr) => prev.domains !== curr.domains}>
          {
            () => {
              const valueChanged = domains && JSON.stringify(form.getFieldValue("domains")) != JSON.stringify(domains)
              return (
                <Button disabled={!valueChanged} htmlType="submit" >
                  Save
                </Button>
              )
            }
          }
        </Form.Item>
      </Form>
    </div>
  );
};

export default WhiteListedDomains;
