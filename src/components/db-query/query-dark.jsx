import React, { useState } from "react";
import { Col } from "antd"
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/3024-day.css';
import 'codemirror/lib/codemirror.css';
import "./query.css"

const CodeBlock1 = ({ }) => {

    const [selectedRule, setselectedRule] = useState("")


    return (
        <Col span={11}>
            <div className="query-block">
                <CodeMirror
                    value={selectedRule}
                    options={{
                        mode: { name: 'javascript', json: true },
                        theme: '3024-day',
                        lineNumbers: true,
                        styleActiveLine: true,
                        matchBrackets: true,
                        autoCloseBrackets: true,
                        tabSize: 2
                    }}
                />
            </div>
        </Col>
    )
}

export default CodeBlock1