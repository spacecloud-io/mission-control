import React from "react";
import { Modal, Form, Input } from "antd";
import "./add-secret.css";

const UpdateRootPathModal = (props) => {
    const { getFieldDecorator } = props.form;
    const { rootPath } = props;

    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
          if (!err) {
            props.handleSubmit(values.rootPath).then(() => {
              props.handleCancel();
              props.form.resetFields();
            })
          }
        });
      };

    return(
        <Modal 
        title="Update file root path"
        okText="Save"
        visible={true}
        onCancel={props.handleCancel}
        onOk={handleSubmit}
        width="600px"
        >
            <Form>
                <p>Root path</p>
                {getFieldDecorator("rootPath", {
                rules: [
                  {
                    required: true,
                    message: "Please input a root path"
                  }
                ], initialValue: rootPath
                })(
                    <Input placeholder="Root path to mount the secret at (eg: /home/.aws)" />
                )}
            </Form>
        </Modal>
    );
}

const WrappedRuleForm = Form.create({})(UpdateRootPathModal);

export default WrappedRuleForm;