import React from 'react';
import { Menu, Modal } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

const CardOption = (props) => {

  const { projectID } = useParams();
  const history = useHistory();

  return (
    <Menu>
      <Menu.Item onClick={() => history.push(`/mission-control/projects/${projectID}/integration/details/${'eslaticSearch'}`)}>View Details</Menu.Item>
      <Menu.Item onClick={() => history.push(`/mission-control/projects/${projectID}/integration/permissions/${'eslaticSearch'}`)}>View Permissions</Menu.Item>
      <Menu.Item onClick={() => Modal.warning({
      title:'Are you sure to delete this integration?',
      content:'This is permanent and can’t be undone',
      okText:'Yes, delete',
      cancelText:'No',
      onOk:(props.handleDelete),
      onCancel:(props.handleCancel)
    })}>Delete integration</Menu.Item>
    </Menu>
  );
}

export default CardOption