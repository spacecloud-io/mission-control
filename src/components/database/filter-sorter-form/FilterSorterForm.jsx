import React from "react"
import { Modal, Form, Input, Row, Col, Button, Icon, Select } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

let filters = 1;
let sorters = 1;
const FilterSorterForm = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;

  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
       props.filterTable({
         filters: values.filters.filter(val => val),
         sorters: values.sorters.filter(val => val)
       })
      }
    })
  }

  const initialKeys = [0];
  // FILTERS
   const removeFilter = k => {
    const filterKeys = getFieldValue("filterKeys");
    if (filterKeys.length === 1) {
      return;
    }

    setFieldsValue({
      filterKeys: filterKeys.filter(key => key !== k)
    });
  };

  const filterAdd = () => {
      const filterKeys = getFieldValue("filterKeys");
      const nextKeys = filterKeys.concat(filters++);
      setFieldsValue({
        filterKeys: nextKeys
      });
  };

  getFieldDecorator("filterKeys", { initialValue: initialKeys });
  const filterKeys = getFieldValue("filterKeys");
  const formItemsFilters = filterKeys.map((k, index) => (
    <Row key={k} gutter={16}>
      <Col span={7}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`filters[${k}].column`, {})
          (<Input placeholder="column"/>)
          }
        </Form.Item>
        <br/>
        {index === filterKeys.length - 1 && (
          <Button onClick={() => filterAdd()} style={{marginTop: -10}}>
            Add another filter
          </Button>
        )}
      </Col>
      <Col span={7}>
        <Form.Item style={{ display: "inline-block", width: '100%' }} >
          {getFieldDecorator(`filters[${k}].operation`, {})
          (<Select placeholder="operation">
            <Select.Option value="==">==</Select.Option>
            <Select.Option value="!=">!=</Select.Option>
            <Select.Option value=">">></Select.Option>
            <Select.Option value="<">{'<'}</Select.Option>
            <Select.Option value=">=">{'>='}</Select.Option>
            <Select.Option value="<=">{'<='}</Select.Option>
          </Select>)
          }
        </Form.Item>
      </Col>
      <Col span={7}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`filters[${k}].value`, {})
          (<Input placeholder="value"/>)
          }
        </Form.Item>
      </Col>
      <Col span={3}>
        {index !== filterKeys.length - 1 && (
          <Button type="link" style={{color: 'black'}} onClick={() => removeFilter(k)}>
            <Icon type="close" />
          </Button>
        )}
      </Col>
    </Row>
  ));

  //SORTER
  const removeSorter = k => {
    const sorterKeys = getFieldValue("sorterKeys");
    if (sorterKeys.length === 1) {
      return;
    }

    setFieldsValue({
      sorterKeys: sorterKeys.filter(key => key !== k)
    });
  };

  const addSorter = () => {
      const sorterKeys = getFieldValue("sorterKeys");
      const nextKeys = sorterKeys.concat(sorters++);
      setFieldsValue({
        sorterKeys: nextKeys
      });
  };

  getFieldDecorator("sorterKeys", { initialValue: initialKeys });
  const sorterKeys = getFieldValue("sorterKeys");
  const formItemsSorters = sorterKeys.map((k, index) => (
    <Row key={k} gutter={16}>
      <Col span={7}>
        <Form.Item style={{ display: "inline-block" }} >
          {getFieldDecorator(`sorters[${k}].column`, {})
          (<Input placeholder="column"/>)
          }
        </Form.Item>
        <br/>
        {index === sorterKeys.length - 1 && (
          <Button onClick={() => addSorter()} style={{marginTop: -10}}>
            Add another sorter
          </Button>
        )}
      </Col>
      <Col span={7}>
        <Form.Item style={{ display: "inline-block", width: '100%' }} >
          {getFieldDecorator(`sorters[${k}].order`, {})
          (<Select placeholder="order">
            <Select.Option value="ascending">Ascending</Select.Option>
            <Select.Option value="descending">Descending</Select.Option>
          </Select>)
          }
        </Form.Item>
      </Col>
      <Col span={3}>
        {index !== sorterKeys.length - 1 && (
          <Button type="link" style={{color: 'black'}} onClick={() => removeSorter(k)}>
            <Icon type="close" />
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
      cancelButtonProps={{style: {float: "left"}}}
      cancelText="Reset filters & sorters"
      onCancel={props.handleCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" onSubmit={handleSubmitClick}>
        <FormItemLabel name="Filter" />
        {formItemsFilters}
        <FormItemLabel name="Sort" />
        {formItemsSorters}
      </Form>
    </Modal>
  );
}

export default Form.create({})(FilterSorterForm);

