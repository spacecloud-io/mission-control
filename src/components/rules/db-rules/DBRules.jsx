import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';

import '../rules.css';

// antd
import { Button, Icon, Col, Row, Switch } from 'antd';

export default props => {
  var rules = props.array
    ? props.rules.map((_, index) => `Rule ${index + 1}`)
    : Object.keys(props.rules);
  return (
    <React.Fragment>
      <div style={{ marginTop: 100, marginLeft: 75, marginBottom: 27 }}>
        <span className='collections'>Collections</span>
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
      </div>
      <Row style={{ marginLeft: 75 }}>
        <Col span={6}>
          <div className="tablehead">Name</div>
          {rules.map((value, index) => (
            <li className="tabledata">{value}</li>
          ))}
        </Col>
        <Col span={18}>
          <div className="codebox">
            Hint : To indent press <b>ctrl + A</b> in the editor and then <b>shift + tab</b>
          </div>
          <div className='code-mirror' style={{ border: '1px solid #E4E4E4' }}>
            {props.rules.todos}
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};
