import React, { useState } from 'react'
import {useSelector, useDispatch} from 'react-redux';
import {set} from 'automate-redux';
import { Select } from 'antd';
import mysqlSmall from '../../assets/mysqlSmall.svg'
import postgresqlSmall from '../../assets/postgresSmall.svg'
import mongodbSmall from '../../assets/mongoSmall.svg'
import './db-selector.css'

import { Modal, Icon, Button, Table } from 'antd'
import Header from "../../components/header/Header"
import AddDBForm from '../database/add-db-form/AddDBForm';

function DbSelector(props) {
  const [modalVisibility, setModalVisibility] = useState(false);
  const databases = useSelector(state => state.databases);
  const dispatch = useDispatch();

  const columns = [
    {
      title: 'DBType',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_,record) => (
        <a style={{ color: "red" }} onClick={() => dispatch(set('databases', databases.filter(val => val.type !== record.type)))}>Remove</a>
      )
    },
  ];

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
        <Table pagination={false} size="middle" dataSource={databases} columns={columns} />;
      </Modal>
      {modalVisibility && (
      <AddDBForm visible={modalVisibility} handleCancel={() => setModalVisibility(false)}/>
      )}
    </>
  )
}

export default DbSelector