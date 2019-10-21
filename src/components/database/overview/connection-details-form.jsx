import React,{useState} from "react"
import { Modal, Form, Input, Radio, Select, InputNumber } from 'antd';
//import { getEventSourceFromType } from "../../utils";
const Connection_String_form = (props) => {
    const [connection_string,setconnection_string]=useState(props.initialValue);
    const handleSubmit = e => {
     // e.preventDefault();
     // props.form.validateFields((err, connection_string) => {//check from where getting it
    //    if (!err) {
          props.handleSubmit(connection_string);
          props.handleCancel();
     //     props.form.resetFields();
     //   }
    //  });
    }
    //const { getFieldDecorator, getFieldValue } = props.form;
    
   // let defaultEventSource = getEventSourceFromType(type, "database")
 // const temp = getFieldValue("source")
 // const eventSource = temp ? temp : defaultEventSource;
  return (
    <Modal
      className="edit-item-modal"
      title='Connection Details'
      okText='SAVE'
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <p><b>Connection String</b></p>
        <Form.Item>
         
            <Input  placeholder={props.initialValue} onChange={e=>setconnection_string(e.target.value)} />
         
        </Form.Item>
        
        
      </Form>
    </Modal>
  );
}

const Connection_string_form= Form.create({})(Connection_String_form);

export default Connection_string_form

