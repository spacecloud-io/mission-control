import React, { useState } from 'react';
import { Modal, Form, Checkbox } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../form-item-label/FormItemLabel"
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/lint/json-lint.js';
import 'codemirror/addon/lint/lint.js';
import { notify } from '../../utils';
import { useForm } from 'antd/lib/form/util';

const SecurityRulesForm = ({ handleSubmit, handleCancel, defaultRule, currentRule }) => {
  const [form] = useForm()
  const currentRuleExists = currentRule && JSON.stringify(currentRule) !== "{}"
  const initialRule = currentRuleExists ? currentRule : defaultRule
  const [rule, setRule] = useState(JSON.stringify(initialRule, null, 2));
  const formInitialValues = { applyDefaultRules: currentRuleExists ? false : true }
  const handleSubmitClick = e => {
    form.validateFields().then(({ applyDefaultRules }) => {
      try {
        const securityRule = applyDefaultRules ? {}:  JSON.parse(rule)
          handleSubmit(securityRule).then(() => {
            notify("success", "Success", "Saved security rules successfully")
            handleCancel()
          })
          .catch(ex => notify("error", "Error saving security rules", ex))
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
        onCancel={handleCancel}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmitClick} initialValues={formInitialValues}>
          <Form.Item name="applyDefaultRules" valuePropName="checked">
            <Checkbox>Apply default security rules</Checkbox>
          </Form.Item>
          <ConditionalFormBlock dependency="applyDefaultRules" condition={() => !form.getFieldValue("applyDefaultRules")}>
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
                autofocus: false,
                gutters: ['CodeMirror-lint-markers'],
                lint: true
              }}
              onBeforeChange={(editor, data, value) => {
                setRule(value)
              }}
            />
          </ConditionalFormBlock>
        </Form>
      </Modal>
    </div>
  );
}

export default SecurityRulesForm;