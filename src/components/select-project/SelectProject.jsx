import React from 'react'
import { useSelector } from 'react-redux'
import { useParams, useHistory } from "react-router-dom";
import { openProject } from "../../utils"

import { CheckOutlined } from '@ant-design/icons';

import { Modal, Button, Table } from 'antd';
import './select-project.css'

function SelectProject({ visible, handleCancel }) {
  const { projectID } = useParams();
  const history = useHistory()
  const projects = useSelector(state => state.projects.map(({ id, name }) => Object.assign({ id, name, selected: id === projectID })))
  const columns = [
    {
      title: '',
      dataIndex: 'selected',
      key: 'selected',
      render: (_, record) => {
        return (
          <div>
            {record.selected && <CheckOutlined className="checked" />}
          </div>
        );
      },

      onCell: (record, _) => {
        return {
          selected: record.selected
        };
      }
    },
    { title: 'Project Name', dataIndex: 'name', key: 'projectName' },
    { title: 'ID', dataIndex: 'id', key: 'id' }
  ];

  return (
    <div >
      <Modal className="select-project" footer={null} closable={false} bodyStyle={{ widtht: "800" }}
        title={<div className="modal-header">
          <h2 className="modal-title">Select a project</h2>
          <Button onClick={() => history.push("/mission-control/create-project")}>Create a project</Button>
        </div>}
        visible={visible}
        onCancel={handleCancel}
        width={700}
      >
        <Table
          pagination={false}
          columns={columns}
          size="middle"
          dataSource={projects}

          onRow={(record) => {
            return {
              style: { cursor: "pointer" },
              onClick: () => {
                if (!record.selected) {
                  openProject(record.id)
                  handleCancel()
                }
              }
            };
          }}
        />
      </Modal>
    </div>
  )
}

export default SelectProject;

