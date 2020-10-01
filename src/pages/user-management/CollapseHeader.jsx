import React from "react";

function CollapseHeader(props) {
  return (
    <div className="header">
      <img src={props.icon} alt={props.desc} height="20" width="20" />
      <span>{props.desc}</span>
    </div>
  );
}

export default CollapseHeader;
