import React from 'react'
import { connect } from 'react-redux'
import { get, set, reset } from 'automate-redux';
import client from "../../client";
import store from "../../store"
import history from "../../history";
import { openProject, notify } from "../../utils"

import { Modal, Icon, Button, Table } from 'antd'
import Header from "../../components/header/Header"
import './select-project.css'

function SelectProject(props) {
  const columns = [
    {
      title: '',
      dataIndex: 'selected',
      key: 'selected',
      render: (_, record) => {
        return (
          <div>
            {record.selected && <Icon type="check" className="checked" />}
          </div>
        )
      },

      onCell: (record, _) => {
        return {
          selected: record.selected
        };
      }
    },
    { title: 'Project Name', dataIndex: 'name', key: 'projectName' },
    { title: 'ID', dataIndex: 'projectId', key: 'projectId' }
  ];

  const projects = props.projects.map(project => Object.assign({}, project, { selected: project.projectId === props.projectId }))
  return (
    <div >
      <Modal className="select-project" footer={null} closable={false} bodyStyle={{ widtht: "800" }}
        title={<div className="modal-header">
          <h2 className="modal-title">Select a project</h2>
          <Button onClick={props.handleCreateProject}>Create a project</Button>
        </div>}
        visible={props.visible}
        onCancel={props.handleCancel}
        width={700}
      >
        <Table
          pagination={false}
          columns={columns}
          size="middle"
          dataSource={projects}

          onRow={(record) => {
            return {
              onClick: () => {
                {
                  if (!record.selected) {
                    props.handleProjectChange(record.projectId)
                    props.handleCancel()
                  }
                }
              }
            };
          }}
        />
      </Modal>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    projectId: get(state, "config.id", ""),
    projects: get(state, "projects", []).map(obj => Object.assign({}, { projectId: obj.id, name: obj.name })),
    visible: ownProps.visible
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleCreateProject: () => {
      const mode = get(store.getState(), "operationConfig.mode", 0)
      if (mode < 1) {
        notify("info", "Info", "You need to upgrade to create multiple projects on the same cluster")
        return
      }
      history.push("/mission-control/create-project")
    },
    handleProjectChange: openProject,
    handleCancel: ownProps.handleCancel
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectProject);

