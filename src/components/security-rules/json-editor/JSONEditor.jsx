import React from "react";
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/lint/json-lint.js';
import 'codemirror/addon/lint/lint.js';

function JSONEditor({ rule, setRule }) {

  return (
    <CodeMirror
      style={{ border: '1px solid #D9D9D9' }}
      value={rule}
      options={{
        mode: { name: 'javascript', json: true },
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        tabSize: 2,
        autofocus: true,
        gutters: [],
        lint: true
      }}
      onBeforeChange={(editor, data, value) => {
        setRule(value);
      }}
    />
  )
}

export default JSONEditor