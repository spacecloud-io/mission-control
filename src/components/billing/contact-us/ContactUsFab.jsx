import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { Button } from "antd";

export default function ContactUsFab() {
  const { projectID } = useParams()
  const history = useHistory()
  const handleClick = () => history.push(`/mission-control/projects/${projectID}/billing/contact-us`)
  return (
    <Button type="primary" shape="circle" icon="message" size="large" style={{ position: "fixed", bottom: 48, right: 48 }} onClick={handleClick} />
  )
}