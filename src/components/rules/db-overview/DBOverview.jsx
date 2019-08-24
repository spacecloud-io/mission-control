import React, { useState, useEffect } from 'react';

import Documentation from '../../../components/documentation/Documentation';
import DbConfigure from '../../../components/database-rules/DbConfigure';

import '../rules.css';

// antd
import { Col, Row, Button, Icon, Divider, Switch } from 'antd';

export default (props) => {

	const [selected, setSelected] = useState(null)

	useEffect(() => {
		if (props.array && props.rules.length) {
			setSelected(0)
		} else if (!props.array && Object.keys(props.rules).length) {
			setSelected(Object.keys(props.rules)[0])
		}
	}, [])

	const handleDeleteClick = (e, rule) => {
		e.stopPropagation()
		props.handleDeleteRule(rule)
	}
	var rules = props.array ? props.rules.map((_, index) => (`Rule ${index + 1}`)) : Object.keys(props.rules);
 
    return (
      <div style={{ marginLeft: 90, marginTop: 80 }}>
        <div style={{ marginBottom: 100 }}>
          <div style={{ float: 'right' }}>
            <Documentation url='https://spaceuptech.com/docs/database' />
          </div>
          <DbConfigure
            updateFormState={props.updateFormState}
            formState={props.formState}
          />
        </div>
        <Row style={{marginBottom: 30}}>
          <Col span={16}>
            <span className="collections">Collections</span>
            <Button
              type='primary'
              style={{
                float: 'right',
                backgroundColor: '#1890FF',
                borderColor: '#1890FF'
              }}
            >
              <Icon type='plus' /> Add a collection
            </Button>
          </Col>
        </Row>
       <Row>
         <Col span={6}>
            <div className="tablehead">Name</div>
            {rules.map((value, index) => (<li className="tabledata">{value}</li>))}
         </Col>
         <Col span={6}>
              <div className="tablehead">Actions</div>
              {rules.map((value, index) => (<li className="tabledata"><a>Edit Schema</a><Divider type="vertical" /><a>Edit Rules</a></li>))}
         </Col>
         <Col span={4}>
              <div className="tablehead">Realtime</div>
              {rules.map((value, index) => (<li className="tabledata"><Switch defaultChecked /></li>))}
         </Col>
       </Row>
      </div>
    );
  }
