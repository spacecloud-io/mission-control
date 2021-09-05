import React from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";

function DocumentationButton() {
  return (
    <Button onClick={() => window.open("https://docs.space-cloud.io/")}>
      Documentation
      <LinkOutlined />
    </Button>
  )
}

export default DocumentationButton