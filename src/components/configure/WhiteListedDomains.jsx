import React from "react";
import { Form, Select, Button, Alert } from "antd";
import { notify } from "../../utils";

const WhiteListedDomains = ({ domains, handleSubmit }) => {
  const [form] = Form.useForm();
  const children = [];

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      handleSubmit(values.domains).then(() => notify("success", "Success", "Saved whitelisted domains successfully"))
        .catch(ex => notify("error", "Error", ex.toString()))
    });
  };

  return (
    <div>
      <h2>Whitelisted Domains</h2>
      <p>
        Add domains you want to whitelist for this project. Space cloud will
            automatically add and renew SSL certificates for these domains{" "}
      </p>
      <Alert
        message="Domain setup"
        description="Make sure you have added A/AAA records pointing these domains to the clusters in this environment."
        type="info"
        showIcon
      />
      <Form form={form} style={{ paddingTop: 10 }} initialValues={{ domains: domains ? domains : [] }} onFinish={handleSubmitClick}>
        <Form.Item name="domains" rules={[
          {
            required: true,
            message: "Please enter the domain for the project"
          }
        ]}>
          <Select
            mode="tags"
            placeholder="Example: foo.bar.com"
            style={{ width: "100%" }}
            tokenSeparators={[","]}
          >
            {children}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Save</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WhiteListedDomains;
