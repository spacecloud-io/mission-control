import React from "react";
import { Form } from "antd";

export default function ConditionalFormRender({ dependency, condition, children }) {
  return <Form.Item noStyle shouldUpdate={(prev, curr) => prev[dependency] !== curr[dependency]}>
    {() => {
      return (
        <React.Fragment>
          {condition() && children}
        </React.Fragment>
      )
    }}
  </Form.Item>
}