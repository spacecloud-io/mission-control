import React, { useState } from 'react'
import { Select } from 'antd';
import mysqlSmall from '../../assets/mysqlSmall.svg'
import postgresqlSmall from '../../assets/postgresSmall.svg'
import mongodbSmall from '../../assets/mongoSmall.svg'
import './db-selector.css'

import { Modal, Icon, Button, Table } from 'antd'
import Header from "../../components/header/Header"
import AddDBForm from '../database/add-db-form/AddDBForm';

const dataSource = [
  {
    key: '1',
    db: 'Postgres',
    alias: 'postgres'
  }
];

const columns = [
  {
    title: 'DBType',
    dataIndex: 'db',
    key: 'db',
  },
  {
    title: 'Alias',
    dataIndex: 'alias',
    key: 'alias',
  },
  {
    title: 'Action',
    key: 'action',
    render: () => (
      <Button type="primary">Remove</Button>
    )
  },
];

function DbSelector(props) {
  const [modalVisibility, setModalVisibility] = useState(false);
  return (
    <>
      <Modal className="select-project" footer={null} closable={false} bodyStyle={{ widtht: "800" }}
        title={<div className="modal-header">
          <Header name="Select a database" />
          <Button type="primary" onClick={() => setModalVisibility(true)}>Add</Button>
        </div>}
        visible={props.visible}
        onCancel={props.handleCancel}
        width={700}
      >
        <Table pagination={false} size="middle" dataSource={dataSource} columns={columns} />;
      </Modal>
      {modalVisibility && (
      <AddDBForm visible={modalVisibility} handleCancel={() => setModalVisibility(false)}/>
      )}
      {/* <div className="db-dropdown">
      <Select
        style={{ width: 200 }}
        placeholder="Select a database"
        onChange={props.handleSelect}
        value={props.selectedDb}
        className="action-rounded"
      >
        <Option value="sql-mysql"><img src={mysqlSmall} alt="mySQL" className="drop-icon"/>  MySQL</Option>
        <Option value="sql-postgres"><img src={postgresqlSmall} alt="postgresSQl" className="drop-icon"/> PostgreSQL</Option>
        <Option value="mongo"><img src={mongodbSmall} alt="mongoDB" className="drop-icon"/> MongoDB</Option>
      </Select>
    </div> */}
    </>
  )
}

export default DbSelector