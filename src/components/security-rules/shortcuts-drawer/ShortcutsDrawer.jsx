import React from "react";
import { Drawer, Row, Col } from "antd";
import "./shortcuts-drawer.css"

function Keyboard(props) {
  return (
    <span style={{ backgroundColor: '#D9D9D9', padding: '5px 10px' }}>
      {props.children}
    </span>
  );
};

function ShortcutsDrawer({ onClose }) {
  return (
    <Drawer
      title='Shortcuts'
      placement='right'
      onClose={onClose}
      visible={true}
      width={720}
    >
      <Row className="shortcuts-row" gutter={16}>
        <Col span={6}>
          <span className="shortcuts-keys-holder">
            <Keyboard>Ctrl</Keyboard> + <Keyboard>C</Keyboard>
          </span>
        </Col>
        <Col span={16}>Copy the selected rule</Col>
      </Row>
      <Row className="shortcuts-row" gutter={16}>
        <Col span={6}>
          <span className="shortcuts-keys-holder">
            <Keyboard>Ctrl</Keyboard> + <Keyboard>X</Keyboard>
          </span>
        </Col>
        <Col span={16}>Cut along with children</Col>
      </Row>
      <Row className="shortcuts-row" gutter={16}>
        <Col span={6}>
          <span className="shortcuts-keys-holder">
            <Keyboard>Ctrl</Keyboard> + <Keyboard>Alt</Keyboard> +<Keyboard>C</Keyboard>
          </span>
        </Col>
        <Col span={16}>Copy the selected rule and its children</Col>
      </Row>
      <Row className="shortcuts-row" gutter={16}>
        <Col span={6}>
          <span className="shortcuts-keys-holder">
            <Keyboard>Ctrl</Keyboard> + <Keyboard>V</Keyboard>
          </span>
        </Col>
        <Col span={16}>Paste the copied rule on any selected AND/OR rule</Col>
      </Row>
      <Row className="shortcuts-row" gutter={16}>
        <Col span={6}>
          <span className="shortcuts-keys-holder">
            <Keyboard>Alt</Keyboard> + <Keyboard>R</Keyboard>
          </span>
        </Col>
        <Col span={16}>Replace the selected rule with the copied rule</Col>
      </Row>
      <Row className="shortcuts-row" gutter={16}>
        <Col span={6}>
          <span className="shortcuts-keys-holder">
            <Keyboard>Delete</Keyboard>
          </span>
        </Col>
        <Col span={16}>Delete the selected rule</Col>
      </Row>
    </Drawer>
  )
}

export default ShortcutsDrawer