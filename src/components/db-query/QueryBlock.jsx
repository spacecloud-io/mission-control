import React from "react";
import { Col } from "antd"
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import "./query.css"

const QueryBlock = ({ value, theme }) => {
  return (
    <Col span={11}>
      <div className="query-block">
        <div className={`${theme === 'dark' ? "darkTheme" : ""}`}>
          <CodeMirror
            value={value}
            options={{
              mode: { name: 'javascript', json: true },
              lineNumbers: true,
              styleActiveLine: true,
              matchBrackets: true,
              autoCloseBrackets: true,
              tabSize: 2,

            }}
          />
        </div>
      </div>
    </Col>
  )
}

export default QueryBlock 