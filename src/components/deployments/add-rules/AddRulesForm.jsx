import React from 'react';
import { Modal, Form } from 'antd';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import JSONCodeMirror from "../../json-code-mirror/JSONCodeMirror";
import { isJson } from '../../../utils';

const AddRuleForm = ({ initialValues, handleSubmit, handleCancel }) => {

  const [form] = Form.useForm();

  const initialRule = {
    apiGroups: initialValues && initialValues.apiGroups ? initialValues.apiGroups : [],
    verbs: initialValues && initialValues.verbs ? initialValues.verbs : [],
    resources: initialValues && initialValues.resources ? initialValues.resources : []
  }
  const formInitialValues = {
    rule: JSON.stringify(initialRule, null, 2)
  }

  const handleSubmitClick = () => {
    const operation = initialValues ? 'edit' : 'add'
    form.validateFields().then(values => {
      const ruleObj = JSON.parse(values.rule)
      handleSubmit(ruleObj, operation);
      handleCancel();
    })
  }

  return (
    <Modal
      width={720}
      title={initialValues ? 'Update rule' : 'Add Rule'}
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
      okText={initialValues ? 'Save' : 'Add'}>
      <Form form={form} initialValues={formInitialValues} onFinish={handleSubmitClick}>
        <FormItemLabel name='Match Rule' />
        <Form.Item name="rule" rules={[{
          validateTrigger: "blur",
          validator: (_, value, cb) => {
            if (!value) {
              cb("Rule cannot be empty!")
              return
            }

            if (!isJson(value)) {
              cb("Please provide a valid JSON object!")
              return
            }

            const ruleObj = JSON.parse(value)
            if (!ruleObj.apiGroups) {
              cb("Please provide apiGroups in the rule!")
              return
            }

            if (!ruleObj.verbs) {
              cb("Please provide verbs in the rule!")
              return
            }

            if (!ruleObj.resources) {
              cb("Please provide resources in the rule!")
              return
            }

            cb()
          }
        }]}>
          <JSONCodeMirror style={{ border: '1px solid #D9D9D9' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddRuleForm;