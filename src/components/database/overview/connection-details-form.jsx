import React,{useState} from "react"
import { Modal, Form, Input, Radio, Select, InputNumber } from 'antd';
const Connection_String_form = (props) => {
    const [connection_string,setconnection_string]=useState(props.initialValue);
    const handleSubmit = e => {
    
          props.handleSubmit(connection_string);
          props.handleCancel();
     
    }
   
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

