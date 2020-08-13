import React from 'react'
import { CheckOutlined } from '@ant-design/icons';
import { Modal, Table, Button } from 'antd';
import './db-selector.css'
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { dbIcons } from '../../utils';
import { getDbConfigs } from '../../operations/database';

function DbSelector(props) {
  const { projectID, selectedDB } = useParams();
  const history = useHistory();
  const dbConfigs = useSelector(state => getDbConfigs(state))

  const dbList = Object.entries(dbConfigs).map(([alias, obj]) => {
    if (!obj.type) obj.type = alias
    return { alias: alias, type: obj.type, name: obj.name, setSvgIcon: dbIcons(alias) }
  })

  const dbcolumns = [
    {
      title: '',
      dataIndex: 'selected',
      key: 'selected',
      render: (_, record) => {
        return (
          <div>
            {record.alias === selectedDB && <CheckOutlined className="checked" />}
          </div>
        );
      },

      onCell: (record, _) => {
        return {
          selected: record.type
        };
      }
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias'
    },
    {
      title: 'DB type',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => {
        return (
          <div>
            <img src={record.setSvgIcon} alt={record.type} style={{ marginRight: 10 }} />
            {text}
          </div>
        );
      }
    },
    {
      title: 'DB / Schema name',
      dataIndex: 'name',
      key: 'name'
    },
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
          dataSource={dbList}
          size="middle"

          onRow={(record) => {
            return {
              style: { cursor: "pointer" },
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