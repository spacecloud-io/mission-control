import React from "react"
import { Radio } from "antd"
import "./radio-cards.css"

export default function RadioCards({ children, size, ...props }) {
  return (
    <Radio.Group {...props} className={`radio-cards radio-cards--size-${size}`}>
      {children}
    </Radio.Group>
  )
}