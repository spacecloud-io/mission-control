import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import "./project-page-layout.css";

export default function ProjectPageLayout({ children }) {
  return (
    <div className="project-page">
      {children}
    </div>
  )
}

export function Content({ children, style = {} }) {
  return (
    <div className="project-page-content" style={style}>
      {children}
    </div>
  )
}

export function InnerTopBar({ title }) {
  const history = useHistory();
  return (
    <div className="project-page-inner-topbar">
      <Button type="link" className="go-back-button" onClick={history.goBack}><LeftOutlined />Go back</Button>
      <span className="title">{title}</span>
    </div>
  )
}
