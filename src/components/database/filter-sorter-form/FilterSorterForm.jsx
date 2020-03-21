import React from "react"
import { Modal, Form, Input, Row, Col, Button, Icon } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

let filters = 1;
const FilterSorterForm = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;

  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
       console.log(values)
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
      const nextKeys = keys.concat(filters++);
      setFieldsValue({
        keys: nextKeys
      });
  };

  getFieldDecorator("keys", { initialValue: initialKeys });
  const keys = getFieldValue("keys");
  const formItemsFilters = keys.map((k, index) => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`filters[${k}].column`, {})
          (<Input placeholder="column"/>)
          }
        </Form.Item>
        <br/>
        {index === keys.length - 1 && (
          <Button onClick={() => add()} style={{marginTop: -10}}>
            Add another filter
          </Button>
        )}
      </Col>
      <Col span={5}>
        {index !== keys.length - 1 && (
          <Button onClick={() => remove(k)}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));

  return (
    <Modal
      title="Filter and sort query results"
      okText="Apply"
      visible={props.visible}
      onCancel={props.handleCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" onSubmit={handleSubmitClick}>
        <FormItemLabel name="Filter" />
        {formItemsFilters}
      </Form>
    </Modal>
  );
}

export default Form.create({})(FilterSorterForm);

