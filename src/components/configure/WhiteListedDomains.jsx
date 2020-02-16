import React from "react";
import { Form, Select, Button, Alert } from "antd";
import { notify } from "../../utils";

const WhiteListedDomains = ({ form, domains, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const children = [];

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.domains).then(() => notify("success", "Success", "Saved whitelisted domains successfully"))
        .catch(ex => notify("error", "Error", ex.toString()))
      }
    });
  };

  return (
    <div style={{ width: 800 }}>
      <Alert
        message="Domain setup"
        description="Make sure you have added A/AAA records pointing these domains to the clusters in this environment."
        type="info"
        showIcon
      />
      <Form style={{ paddingTop: 10 }} onSubmit={handleSubmitClick}>
        <Form.Item>
          {getFieldDecorator("domains", {
            rules: [
              {
                required: true,
                message: "Please enter the domain for the project"
              }
            ],
            initialValue: domains ? domains: []
          })(
            <Select
              mode="tags"
              placeholder="Example: foo.bar.com"
              style={{ width: "100%" }}
              tokenSeparators={[","]}
            >
              {children}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Save</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Form.create({})(WhiteListedDomains);
