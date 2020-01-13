import React from "react"

export default ({ name, description }) => {
  description = description ? `(${description})` : description
  return <p><b>{name}</b> {description && <span style={{ color: "rgba(0,0,0,0.38)" }}><br/>{description}</span>}</p>
}