import React, { useState } from "react"

import { Controlled as CodeMirror } from 'react-codemirror2';
import { Modal, Form, Input, Card } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import jwt from 'jsonwebtoken';
import { notify } from "../../../utils";
import { useEffect } from "react";

const GenerateTokenForm = (props) => {
    const { getFieldDecorator } = props.form;

    const defaultValue = JSON.stringify(props.payloadObject, null, 2)

    var generateToken;
    var decoded;
    var stringifyValue;
    const [data, setData] = useState(defaultValue)

    useEffect(() => {
        decoded = jwt.decode(props.initialToken);
        if (decoded !== null) {
            stringifyValue = JSON.stringify(decoded, null, 2)
            setData(stringifyValue)
        } else {
            stringifyValue = JSON.stringify({}, null, 2)
            setData(stringifyValue)
        }
    }, [])

    generateToken = jwt.sign(JSON.stringify(data), props.secret);

    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            if (!err) {
                try {
                    props.handleSubmit(JSON.parse(data));
                    props.handleCancel();
                } catch (ex) {
                    notify("error", "Error", ex.toString())
                }
            }
        })
    }

    return (
        <Modal
            title="Generate token"
            visible={true}
            okText="Use this token"
            onCancel={props.handleCancel}
            onOk={handleSubmit}
        >
            <Form layout="vertical">
                <FormItemLabel name="Token claims" />
                <CodeMirror
                    value={data}
                    options={{
                        mode: { name: "javascript", json: true },
                        lineNumbers: true,
                        styleActiveLine: true,
                        matchBrackets: true,
                        autoCloseBrackets: true,
                        tabSize: 2,
                        autofocus: true
                    }}
                    onBeforeChange={(editor, data, value) => {
                        setData(value)
                    }}
                />
                <div style={{ paddingTop: 16 }}>
                    <FormItemLabel name="Generated token" />
                    <Card bodyStyle={{ backgroundColor: "#F2F2F2" }}>
                        <h4>{generateToken}</h4>
                    </Card>
                </div>
            </Form>
        </Modal>
    )
}

export default Form.create({})(GenerateTokenForm)