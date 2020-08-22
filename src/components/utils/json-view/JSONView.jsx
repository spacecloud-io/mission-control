import React from "react";
import { parseJSONSafely } from "../../../utils";
import ReactJson from 'react-json-view'

function JSONView({ data, parse }) {
  if (parse) {
    data = parseJSONSafely(data)
  }
  return (
    <ReactJson
      src={data}
      name={false}
      style={{ maxWidth: 720 }}
      collapseStringsAfterLength={50}
      enableClipboard={false}
      displayDataTypes={false}
    />
  )
}

export default JSONView