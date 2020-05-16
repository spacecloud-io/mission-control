import React from "react"

export default function FormItemLabel({ name, description, hint }) {
  return (
    <p style={{ fontSize: "16px" }}>
      <b>{name}</b> {hint && <span style={{ fontSize: "14px" }}>{hint}</span>}
      {description && <React.Fragment>
        <br />
        <span style={{
          marginTop: 4,
          fontSize: "14px"
        }}>{description}</span>
      </React.Fragment>}
    </p>
  )
}