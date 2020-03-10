import React from "react";
import { Radio } from "antd";
import "./radio-card.css";

export default ({ layout, ...otherProps }) => (
  <Radio.Button
    className={`radio-card ${
      layout === "card" ? "radio-card--layout-card" : ""
    } ${
      layout === "db-card" ? "radio-card--layout-db-card" : ""
    }`}
    {...otherProps}
  ></Radio.Button>
);
