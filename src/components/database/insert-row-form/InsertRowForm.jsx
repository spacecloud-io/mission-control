import React from "react"
import { Modal, Form, Input, Row, Col, Button, Icon } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

let rows = 1;
const InsertRowForm = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;

  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
       props.insertRow(values.rows.filter(val => val))
      }
    })
  }

  const initialKeys = [0];
   const remove = k => {
    const keys = getFieldValue("keys");
    if (keys.length === 1) {
      return;
    }

    setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  const add = () => {
      const keys = getFieldValue("keys");
      const nextKeys = keys.concat(rows++);
      setFieldsValue({
        keys: nextKeys
      });
  };

  getFieldDecorator("keys", { initialValue: initialKeys });
  const keys = getFieldValue("keys");
  const formItems = keys.map((k, index) => (
    <Row key={k} gutter={16}>
      <Col span={7}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`rows[${k}].field`, {})
          (<Input placeholder="field"/>)
          }
        </Form.Item>
        <br/>
        {index === keys.length - 1 && (
          <Button onClick={() => add()} style={{marginTop: -10}}>
            Insert another field
          </Button>
        )}
      </Col>
      <Col span={7}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`rows[${k}].value`, {})
          (<Input placeholder="value"/>)
          }
        </Form.Item>
      </Col>
      <Col span={3}>
        {index !== keys.length - 1 && (
          <Button type="link" style={{color: 'black'}} onClick={() => remove(k)}>
            <Icon type="close" />
          </Button>
        )}
      </Col>
    </Row>
  ));
  
  return (
    <Modal
      title="Insert row"
      okText="Save"
      visible={props.visible}
      onCancel={props.handleCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" onSubmit={handleSubmitClick}>
        {formItems}
      </Form>
    </Modal>
  );
}

export default Form.create({})(InsertRowForm);

