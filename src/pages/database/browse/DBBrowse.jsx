import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import { set, increment, decrement } from 'automate-redux';
import ReactGA from 'react-ga'

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import FilterSorterForm from "../../../components/database/filter-sorter-form/FilterSorterForm";
import InsertRowForm from "../../../components/database/insert-row-form/InsertRowForm";

import { getProjectConfig, notify, getSchemas } from '../../../utils';
import { Button, Select, Icon, Table, Tooltip } from "antd";
import {API, cond} from "space-api";

const Browse = () => {

  const [isFilterSorterFormVisible, setFilterSorterFormVisibility] = useState(false);
  const [isInsertRowFormVisible, setInsertRowFormVisibility] = useState(false);
  const [column, setColumn] = useState([]);
  const [data, setData] = useState([]);
  const [counter, setCounter] = useState(0);

  const { projectID, selectedDB } = useParams()
  const dispatch = useDispatch()

  const projects = useSelector(state => state.projects)
  const selectedCol = useSelector(state => state.uiState.selectedCollection)

  const filters = useSelector(state => state.uiState.explorer.filters);
  const sorters = useSelector(state => state.uiState.explorer.sorters);

  const collections = Object.keys(getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections`, {}));
  const dbAlias = getProjectConfig(projects, projectID, `modules.eventing.dbType`);
  const api = new API(projectID, "http://localhost:4122");
  const db = api.DB(dbAlias);

  useEffect(() => {
    ReactGA.pageview("/projects/database/rules");
  }, [])

  const getColumnNames = rawData => {
    let columnNames = [];
    for(const row of rawData){
      for(const keys of Object.keys(row)){
        columnNames.push(keys);
      }
    }
    return [...new Set(columnNames)].map(val => ({key: val, title: val,dataIndex: val}))
  }

  useEffect(() => {
    if(selectedCol){
      let hasUniqueKey = false;
      let uniqueKey = "";
      getSchemas(projectID, selectedDB)[selectedCol]
      .forEach(val => {
        if (val.isPrimaryField) {
          hasUniqueKey = true;
          uniqueKey = val.name;
          return;
        }
      })

      let filtersCond = [];
      let sortersCond = [];

      for(let el of filters){
        filtersCond.push(cond(el.column, el.operation, el.value))
      }
      
      for(let el of sorters){
        if (el.order === "descending") sortersCond.push(`-${el.column}`)
        else sortersCond.push(el.column)
      }

      dispatch(increment("pendingRequests"));
      db.get(selectedCol)
      .where(...filtersCond)
      .sort(...sortersCond)
      .apply()
      .then(({status, data}) => {
        if(status !== 200){
          notify("error", "Error", data.error, 5);
          setData([]);
          return
        }

        let columnNames = getColumnNames(data.result);
        columnNames.unshift({
          key: 'action', 
          title: '', 
          render: (record) => (
            <span>
						 <Button type="link" disabled={!hasUniqueKey} style={{color: 'black'}}>Edit</Button>
						 <Button type="link" disabled={!hasUniqueKey} style={{ color: "red" }} onClick={() => deleteRow(uniqueKey, record[uniqueKey])}>Delete</Button>
            </span>
          )})

        setColumn(columnNames)
        setData(data.result)
      })
     .finally(() => dispatch(decrement("pendingRequests")));
    }
  }, [filters, sorters, selectedCol, counter])

  // Handlers
  const handleTableChange = col => {
    dispatch(set("uiState.selectedCollection", col))
  }

  const filterTable = ({filters, sorters}) => {
    console.log(filters)
    console.log()
    console.log(sorters)

    dispatch(set("uiState.explorer.filters", filters))
    dispatch(set("uiState.explorer.sorters", sorters))

    setFilterSorterFormVisibility(false)
  }

  const insertRow = values => {
    let docs = {};
    for(let row of values){
      docs[row.column] = row.value;
    }
    db.insert(selectedCol).doc(docs).apply()
    .then(res => {
      if(res.status !== 200){
        notify("error", "Error", "There was some error inserting a row", 3);
        return;
      }
      notify("success", "Successfully inserted a row!", "", 3);
    })

    setInsertRowFormVisibility(false);
  }

  const deleteRow = (uniqueKey, value) => {
    const whereClause = cond(uniqueKey, "==", value)
    db.delete(selectedCol)
    .where(whereClause)
    .apply()
    .then(({status}) => {
      if(status !== 200) {
        notify("error", "There was some error in deleting the row", "", 5)
        return;
      }
      notify("success", "Row deleted successfully", "", 5)
      setCounter(counter+1);
    })
  }

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem='database' />
        <div className='page-content page-content--no-padding'>
          <DBTabs
            selectedDB={selectedDB}
            projectID={projectID}
            activeKey='browse'
          />
          <div className="db-tab-content">
            <Select 
             size="large" 
             style={{width: 220, marginRight: 24}} 
             placeholder="Select a table" 
             onChange={handleTableChange}
             defaultValue={selectedCol ? selectedCol : undefined}
            >
              {collections.map(col => <Select.Option value={col}>{col}</Select.Option>)}
            </Select>
            <Button size="large" onClick={() => setFilterSorterFormVisibility(true)}>Filters & Sorters <Icon type="filter" /></Button>
            <Button style={{ float: "right" }} type="primary" className="insert-row" ghost onClick={() => setInsertRowFormVisibility(true)}><Icon type="plus" />Insert Row</Button>
            {
              data.length === 0 && (
                <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Select a collection</p>
              )
            }
            {data.length !== 0 && (
              <Table
               className="db-browse-table" 
               columns={column} 
               dataSource={data} 
               style={{marginTop: 21}}
               bordered
               pagination={false} 
              />
            )}
          </div>
        </div>
      </div>
      {
        isFilterSorterFormVisible && (
          <FilterSorterForm 
           visible={isFilterSorterFormVisible}
           handleCancel={() => setFilterSorterFormVisibility(false)}
           filterTable={filterTable}
          />
        )
      }
      {
        isInsertRowFormVisible && (
          <InsertRowForm 
           visible={isInsertRowFormVisible}
           handleCancel={() => setInsertRowFormVisibility(false)}
           insertRow={insertRow}
          />
        )
      }
    </React.Fragment>
  );
};

export default Browse