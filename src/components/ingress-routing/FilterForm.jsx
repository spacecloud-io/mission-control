import React from "react"
import { Modal, Select, Input, Form, Button, Space } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const formInitialValues = { services: [], requestUrls: [], targetHosts: [], requestHosts: [] }

const FilterForm = ({ handleCancel, handleSubmit, serviceNames = [], initialValues = formInitialValues }) => {
  const [form] = Form.useForm();

  const handleSubmitClick = () => {
    form.validateFields().then((filterValues) => {
      handleSubmit(filterValues)
      handleCancel();
    });
  }

  return (
    <Modal
      title="Filter ingress routes"
      okText="Apply"
      visible={true}
      width={720}
      onCancel={handleCancel}
      onOk={handleSubmitClick}
      cancelButtonProps={{
        style: { float: "left" }, onClick: () => {
          handleSubmit(formInitialValues)
          handleCancel()
        }
      }}
      cancelText="Reset Filters"
    >
      <Form layout="vertical" form={form} onFinish={handleSubmitClick} initialValues={initialValues}>
        <FormItemLabel name="Filter by services" />
        <Form.Item name="services">
          <Select mode="tags" placeholder="Select services">
            {serviceNames.map(val => <Option key={val}>{val}</Option>)}
          </Select>
        </Form.Item>
        <FormItemLabel name="Filter by request URLs" />
        <Form.List name="requestUrls">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field) => (
                  <Form.Item key={field.key} style={{ marginBottom: 8 }}>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: "Please input a request URL/prefix",
                        }
                      ]}
                      noStyle
                    >
                      <Input placeholder="Request URL/prefix" style={{ width: "90%" }} />
                    </Form.Item>
                    <DeleteOutlined
                      style={{ marginLeft: 16 }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button onClick={() => {
                    form.validateFields(fields.map(obj => ["targetHosts", obj.name]))
                      .then(() => add())
                      .catch(ex => console.log("Exception", ex))
                  }}>
                    <PlusOutlined /> Add request URL
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>
        <FormItemLabel name="Filter by target hosts" />
        <Form.List name="targetHosts">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field) => (
                  <Form.Item key={field.key} style={{ marginBottom: 8 }}>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: "Please input a target host",
                        }
                      ]}
                      noStyle
                    >
                      <Input placeholder="Target host" style={{ width: "90%" }} />
                    </Form.Item>
                    <DeleteOutlined
                      style={{ marginLeft: 16 }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button onClick={() => {
                    form.validateFields(fields.map(obj => ["targetHosts", obj.name]))
                      .then(() => add())
                      .catch(ex => console.log("Exception", ex))
                  }}>
                    <PlusOutlined /> Add target host
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>
        <FormItemLabel name="Filter by allowed request hosts" />
        <Form.List name="requestHosts">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field) => (
                  <Form.Item key={field.key} style={{ marginBottom: 8 }}>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: "Please input a request host",
                        }
                      ]}
                      noStyle
                    >
                      <Input placeholder="Request host" style={{ width: "90%" }} />
                    </Form.Item>
                    <DeleteOutlined
                      style={{ marginLeft: 16 }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button onClick={() => {
                    form.validateFields(fields.map(obj => ["requestHosts", obj.name]))
                      .then(() => add())
                      .catch(ex => console.log("Exception", ex))
                  }}>
                    <PlusOutlined /> Add request host
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default FilterForm

