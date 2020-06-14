import React from "react";
import { Form } from "antd";

export default function ConditionalFormBlock({ dependency, condition, children, shouldUpdate }) {
  if (!shouldUpdate) shouldUpdate = (prev, curr) => prev[dependency] !== curr[dependency]
  return <Form.Item noStyle shouldUpdate={shouldUpdate}>
    {() => {
      return (
        <React.Fragment>
          {condition() && children}
        </React.Fragment>
      )
    }}
  </Form.Item>
}