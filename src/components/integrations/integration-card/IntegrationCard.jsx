import React, { useState } from 'react';
import { Card, Button, Popover, Menu, Modal, Typography } from 'antd';
import { EllipsisOutlined } from "@ant-design/icons";
import Highlighter from 'react-highlight-words';

const { Paragraph } = Typography;

const CardOptions = ({ handleViewDetails, handleViewPermissions, handleDelete, handleClick }) => {

  const DeleteWarning = () => Modal.confirm({
    title: 'Are you sure to uninstall this integration?',
    content: 'This is permanent and can’t be undone',
    okText: 'Yes, uninstall',
    cancelText: 'No',
    onOk: (handleDelete)
  })

  return (
    <Menu style={{ borderRight: "none" }} onClick={handleClick}>
      <Menu.Item onClick={handleViewDetails}>View Details</Menu.Item>
      <Menu.Item onClick={handleViewPermissions}>View Permissions</Menu.Item>
      <Menu.Item onClick={DeleteWarning}>Uninstall integration</Menu.Item>
    </Menu>
  );
}


const IntegrationCard = ({ installed, name, desc, imgUrl, handleDelete, handleViewDetails, handleViewPermissions, handleOpenConsole, handleInstall, searchText }) => {

  const [popoverVisible, setPopoverVisible] = useState(false)

  return (
    <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px', height: 300 }}>
      <center><img src={imgUrl} style={{ width: 64, height: 64 }} /></center>
      {installed && (
        <Popover
          content={<CardOptions handleClick={() => setPopoverVisible(false)} handleViewPermissions={handleViewPermissions} handleViewDetails={handleViewDetails} handleDelete={handleDelete} />}
          trigger='click'
          placement='bottomLeft'
          visible={popoverVisible}
          onVisibleChange={visibe => setPopoverVisible(visibe)}>
          <EllipsisOutlined style={{ position: 'absolute', right: 8, top: 24, fontSize: "24px" }} rotate={90} />
        </Popover>
      )}
      <center>
        <h3 style={{ marginTop: 24 }}>
        <Highlighter 
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={name ? name.toString() : ''}
          /></h3>
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>
          {desc}
        </Paragraph>
      </center>
      <center style={{ position: "absolute", bottom: 24, left: 0, width: "100%" }}>
        {!installed && <Button type='primary' onClick={handleInstall} ghost>Install</Button>}
        {installed && <Button type='primary' onClick={handleOpenConsole} ghost>Open console</Button>}
      </center>
    </Card>
  );
}

export default IntegrationCard;