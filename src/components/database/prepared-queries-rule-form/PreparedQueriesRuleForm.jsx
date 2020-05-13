import React, { useState } from 'react';
import { Modal, Form, Checkbox } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify } from '../../../utils';
import { useForm } from 'antd/lib/form/util';

const PreparedQueriesRuleForm = ({ handleSubmit, handleCancel, conformLoading, defaultRules }) => {
    const [form] = useForm()

    const [rule, setRule] = useState(JSON.stringify(defaultRules, null, 2));
    const [applyDefaultRules, setApplyDefaultRules] = useState(true)

    const handleSubmitClick = values => {
        form.validateFields().then(values => {
            try {
                handleSubmit(values.defaultRuleCheck,
                    JSON.parse(rule)
                );
            } catch (ex) {
                notify("error", "Error", ex.toString())
            }
        })
    }

    return (
        <div>
            <Modal
                className='edit-item-modal'
                visible={true}
                width={520}
                okText="Add"
                title="Configure security rules"
                onOk={handleSubmitClick}
                confirmLoading={conformLoading}
                onCancel={handleCancel}
            >
                <Form layout="vertical" form={form} onFinish={handleSubmitClick} >
                    <Form.Item name="defaultRuleCheck" >
                        <Checkbox checked={applyDefaultRules}
                        onChange={e =>
                            setApplyDefaultRules(false)
                        }>Apply default security rules</Checkbox>
                    </Form.Item>
                    {!applyDefaultRules && <div>
                    <FormItemLabel name="Custom security rules" />
                        <CodeMirror
                            value={rule}
                            options={{
                                mode: { name: "javascript", json: true },
                                lineNumbers: true,
                                styleActiveLine: true,
                                matchBrackets: true,
                                autoCloseBrackets: true,
                                tabSize: 2,
                                autofocus: false
                            }}
                            onBeforeChange={(editor, data, value) => {
                                setRule(value)
                            }}
                        /></div>}
                </Form>
            </Modal>
        </div>
    );
}

export default PreparedQueriesRuleForm;