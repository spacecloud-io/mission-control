import React, { useEffect, useState } from "react";
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/go/go';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/lint/json-lint.js';
import 'codemirror/addon/lint/lint.js';

function JSONCodeMirror(props) {
  const [value, setValue] = useState(props.value ? props.value : '')

  const handleChangeValue = (value) => {
    setValue(value)
    props.onChange(value)
  }
  return (
    <div style={props.style ? props.style : undefined}>
      <CodeMirror
        value={value}
        options={{
          mode: { name: "javascript", json: true },
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          tabSize: 2,
          gutters: [],
          lint: value ? true : false,
          ...props.options
        }}
        onBeforeChange={(editor, data, value) => {
          handleChangeValue(value);
        }}
      />
    </div>
  )
}

export default JSONCodeMirror;