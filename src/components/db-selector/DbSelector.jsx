import React from 'react'
import { Modal, Table, Icon, Button } from 'antd';
import './db-selector.css'
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getProjectConfig } from '../../utils';
import { dbTypes } from '../../constants';
import { dbIcons } from '../../utils';

function DbSelector(props) {
  const { projectID, selectedDB } = useParams();
  const history = useHistory();
  const projects = useSelector(state => state.projects)
  const crudModule = getProjectConfig(projects, projectID, "modules.crud", {})

  const array = Object.entries(crudModule).map(([alias, obj]) => {
    if (!obj.type) obj.type = alias
    return { alias: alias, dbtype: obj.type, setSvgIcon: dbIcons(projects, projectID, alias) }
  })

  const dbcolumns = [
    {
      title: '',
      dataIndex: 'selected',
      key: 'selected',
      render: (_, record) => {
        return (
          <div>
            {record.dbtype && <Icon type="check" className="checked" />}
          </div>
        )
      },

      onCell: (record, _) => {
        return {
          selected: record.dbtype
        };
      }
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias'
    },
    {
      title: 'DB Type',
      dataIndex: 'dbtype',
      key: 'dbtype',
      render: (text, record) => {
        return (
          <div>
            <img src={record.setSvgIcon} alt={record.dbtype} style={{ marginRight: 10 }} />
            {text}
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <Modal
        className="select-database"
        title={<div className="modal-header">
          <h2 className="modal-title">Select a database</h2>
          <Button onClick={() => history.push(`/mission-control/projects/${projectID}/database/add-db`)}>Add Database</Button>
        </div>}
        footer={null}
        closable={false}
        bodyStyle={{ width: "800" }}
        visible={props.visible}
        onCancel={props.handleCancel}
        width={700}
      >
        <Table
          pagination={false}
          columns={dbcolumns}
          dataSource={array}
          size="middle"

          onRow={(record) => {
            return {
              onClick: () => {
                {
                  props.handleSelect(record.alias)
                  props.handleCancel()
                }
              }
            };
          }}
        />
      </Modal>
    </div>
  )
}

export default DbSelector