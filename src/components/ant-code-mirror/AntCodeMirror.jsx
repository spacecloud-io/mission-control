import React, { useState } from "react";
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/go/go';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';

function AntCodeMirror(props) {
  const [value, setValue] = useState(props.value ? props.value : '')

  const handleChangeValue = (value) => {
    setValue(value)
    props.onChange(value)
  }
  return (
    <div style={props.style ? props.style : undefined}I>
      <CodeMirror
        value={value}
        options={props.options}
        onBeforeChange={(editor, data, value) => {
          handleChangeValue(value);
        }}
      />
    </div>
  )
}

export default AntCodeMirror;