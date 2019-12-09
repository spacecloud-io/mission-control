import React from 'react'
import { Modal, Table, Icon, Button } from 'antd';
import './db-selector.css'
import { useHistory } from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {getProjectConfig} from '../../utils';
import {dbTypes} from '../../constants';

function DbSelector(props) {
  const {projectID, selectedDB} = useParams();
  const history = useHistory();
  const projects = useSelector(state => state.projects)
  const crudModule = getProjectConfig(projects, projectID, "modules.crud", {})
  const mysqlSvg = require(`../../assets/mysqlSmall.svg`)
  const postgresSvg = require(`../../assets/postgresSmall.svg`)
  const mongoSvg = require(`../../assets/mongoSmall.svg`)

  const array = Object.entries(crudModule).map(([alias, obj]) => {
    if (!obj.type) obj.type = alias
    return {alias: alias, dbtype: obj.type}
  })

  let checkDB = ''
  if (crudModule[selectedDB]) checkDB = crudModule[selectedDB].type

  var svg = mongoSvg
  switch (checkDB) {
    case dbTypes.MONGO:
      svg = mongoSvg
      break;
    case dbTypes.MYSQL:
      svg = mysqlSvg
      break;
    case dbTypes.POSTGRESQL:
      svg = postgresSvg
      break;
    default:
      svg = postgresSvg
  }

  console.log(svg)
  
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
      render: (text, record) =>{
        return(
          <div>
            <img src={svg} alt={checkDB} style={{marginRight: 10}} />
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
          <Button onClick={() => history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/add-db`)}>Add Database</Button>
        </div>} 
        footer={null}
        closable={false}  
        bodyStyle={{width: "800"}}
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