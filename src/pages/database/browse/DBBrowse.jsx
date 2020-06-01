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
import EditRowForm from "../../../components/database/edit-row-form/EditRowForm";

import { notify, getSchemas, getTrackedCollectionNames } from '../../../utils';
import { Button, Select, Icon, Table, Popconfirm } from "antd";
import { API, cond } from "space-api";
import { spaceCloudClusterOrigin } from "../../../constants"

let column = [];
let editRowData = {};
let uniqueKeys = [];
const Browse = () => {

  const [isFilterSorterFormVisible, setFilterSorterFormVisibility] = useState(false);
  const [isInsertRowFormVisible, setInsertRowFormVisibility] = useState(false);
  const [isEditRowFormVisible, setEditRowFormVisibility] = useState(false);
  const [data, setData] = useState([]);

  const { projectID, selectedDB } = useParams()
  const dispatch = useDispatch()

  const selectedCol = useSelector(state => state.uiState.selectedCollection)
  const filters = useSelector(state => state.uiState.explorer.filters);
  const sorters = useSelector(state => state.uiState.explorer.sorters);
  const collections = useSelector(state => getTrackedCollectionNames(state, projectID, selectedDB))
  const api = new API(projectID, spaceCloudClusterOrigin);
  const db = api.DB(selectedDB);
  const primitives = ["id", "string", "integer", "float", "boolean", "datetime", "json", "array"]

  const colSchema = getSchemas(projectID, selectedDB)[selectedCol];

  useEffect(() => {
    ReactGA.pageview("/projects/database/browse");
  }, [])

  useEffect(() => {
    if(collections.length > 0 && !selectedCol){
      dispatch(set("uiState.selectedCollection", collections[0]))
    }
  }, [dispatch, collections])

  const getUniqueKeys = () => {
    uniqueKeys = [];
    if(!colSchema) return;
    colSchema
      .forEach(val => {
        if (val.isPrimaryField || val.hasUniqueKey) {
          uniqueKeys.push(val.name);
        }
      })
  }

  const booleanColumns = () => {
    const columns = [];
    colSchema
    .forEach(val => {
      if (val.type === "Boolean") {
        columns.push(val.name)
      }
    })
    return columns;
  }

  const jsonColumns = () => {
    const columns = [];
    colSchema
    .forEach(val => {
      if (val.type === "JSON" || !primitives.includes(val.type.toLowerCase())) {
        columns.push(val.name)
      }
    })
    return columns;
  }

  const getTableData = () => {
    if (selectedCol) {

      let filtersCond = [];
      let sortersCond = [];

      if (filters) {
        for (let el of filters) {
          filtersCond.push(cond(el.column, el.operation, el.value))
        }
      }

      if (sorters) {
        for (let el of sorters) {
          if (el.order === "descending") sortersCond.push(`-${el.column}`)
          else sortersCond.push(el.column)
        }
      }

      dispatch(increment("pendingRequests"));
      db.get(selectedCol)
        .where(...filtersCond)
        .sort(...sortersCond)
        .apply()
        .then(({ status, data }) => {
          if (status !== 200) {
            notify("error", "Error", data.error, 5);
            column = getColumnNames();
            setData([]);
            return
          }

          column = getColumnNames();
          column.unshift({
            key: 'action',
            title: '',
            render: (record) => (
              <span>
                <Button 
                 type="link" 
                 disabled={uniqueKeys.length === 0} 
                 style={{ color: 'black' }} 
                 onClick={() => { 
                   setEditRowFormVisibility(true); 
                   editRowData = record;
                 }}
                >
                  Edit
                </Button>
                <Popconfirm
                 title="Are you sure delete this row?"
                 onConfirm={() => deleteRow(record)}
                 okText="Yes"
                 cancelText="No"
                >
                  <Button 
                   type="link" 
                   disabled={uniqueKeys.length === 0} 
                   style={{ color: "red" }} 
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </span>
            )
          })

          const columnsWithTypeBoolean = booleanColumns();
          if (columnsWithTypeBoolean.length > 0) {
            data.result.forEach(val => {
              columnsWithTypeBoolean.forEach(el => {
                val[el] = val[el]  ? "true" : "false"
              })
            })
          }
          const columnsWithJSON = jsonColumns();
          if (columnsWithJSON.length > 0) {
            data.result.forEach(val => {
              columnsWithJSON.forEach(el => {
                val[el] = JSON.stringify(val[el], null, "\t")
              })
            })
          }
          setData(data.result);
        })
        .finally(() => dispatch(decrement("pendingRequests")));
    }
  }

  const getColumnNames = () => {
    let columnNames = [];
    if (!colSchema) return;
    colSchema
      .forEach(val => {
        columnNames.push(val.name)
      })
    return columnNames.map(val => ({ key: val, title: val, dataIndex: val }))
  }

  useEffect(() => {
    getTableData();
  }, [filters, sorters, selectedCol])

  useEffect(() => {
    if(selectedCol) {
      getUniqueKeys();
    }
  }, [selectedCol])

  // Handlers
  const handleTableChange = col => {
    dispatch(set("uiState.selectedCollection", col))
  }

  const filterTable = ({ filters, sorters }) => {

    dispatch(set("uiState.explorer.filters", filters))
    dispatch(set("uiState.explorer.sorters", sorters))

    setFilterSorterFormVisibility(false)
  }

  const insertRow = values => {
    let docs = {};
    for (let row of values) {
      docs[row.column] = row.value;
    }
    console.log(docs);
    db.insert(selectedCol).doc(docs).apply()
      .then(res => {
        if (res.status !== 200) {
          notify("error", "Error", res.data.error, 5);
          return;
        }
        notify("success", "Successfully inserted a row!", "", 5);
        getTableData();
      })

    setInsertRowFormVisibility(false);
  }

  const deleteRow = (record) => {
    const whereClause = [];
    uniqueKeys.forEach(val => {
      whereClause.push(cond(val, "==", record[val]))
    })
    db.delete(selectedCol)
      .where(...whereClause)
      .apply()
      .then(({ status }) => {
        if (status !== 200) {
          notify("error", "There was some error in deleting the row", "", 5)
          return;
        }
        notify("success", "Row deleted successfully", "", 5)
        getTableData();
      })
  }

  const editRow = values => {
    const whereClause = [];
    uniqueKeys.forEach(val => {
      whereClause.push(cond(val, "==", editRowData[val]))
    })
    const row = db.update(selectedCol).where(...whereClause);
    let set = {};
    let remove = {};
    let rename = {};
    let inc = {};
    let mul = {};
    let min = {};
    let max = {};
    let push = {};
    let currentDate = [];
    let currentTimestamp = [];

    for (let row of values) {
      switch (row.operation) {
        case "set":
          set[row.column] = row.value;
          break;

        case "unset":
          remove[row.column] = "";
          break;

        case "rename":
          rename[row.column] = row.value;
          break;

        case "inc":
          inc[row.column] = row.value;
          break;

        case "multiply":
          mul[row.column] = row.value;
          break;

        case "min":
          min[row.column] = row.value;
          break;

        case "max":
          max[row.column] = row.value;
          break;

        case "currentDate":
          currentDate.push(row.column);
          break;

        case "currentTimestamp":
          currentTimestamp.push(row.column);
          break;

        case "push":
          push[row.column] = row.value;
          break;
      }
    }

    if (Object.keys(set).length !== 0) {
      row.set(set);
    }

    if (Object.keys(remove).length !== 0) {
      row.remove(remove);
    }

    if (Object.keys(rename).length !== 0) {
      row.rename(rename);
    }

    if (Object.keys(inc).length !== 0) {
      row.inc(inc);
    }

    if (Object.keys(mul).length !== 0) {
      row.mul(mul);
    }

    if (Object.keys(min).length !== 0) {
      row.min(min);
    }

    if (Object.keys(max).length !== 0) {
      row.max(max);
    }

    if (Object.keys(push).length !== 0) {
      row.push(push);
    }

    if (currentDate.length !== 0) {
      currentDate.forEach(val => {
        row.currentDate(val);
      })
    }

    if (currentTimestamp.length !== 0) {
      currentTimestamp.forEach(val => {
        row.currentTimestamp(val);
      })
    }

    row.apply()
    .then(({status, data}) => { 
      if (status !== 200) {
        notify("error", data.error, "", 5);
        return;
      }
      notify("success", `Row successfully updated!`, "", 5);
      getTableData();
    })
    setEditRowFormVisibility(false);
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
              style={{ width: 240, marginRight: 24 }}
              placeholder="Select a table"
              onChange={handleTableChange}
              defaultValue={selectedCol ? selectedCol : collections.length > 0 ? collections[0] : undefined}
            >
              {collections.map(col => <Select.Option value={col}>{col}</Select.Option>)}
            </Select>
            {colSchema && (
              <>
              <Button onClick={() => setFilterSorterFormVisibility(true)}>Filters & Sorters <Icon type="filter" /></Button>
              <Button style={{ float: "right" }} type="primary" className="insert-row" ghost onClick={() => setInsertRowFormVisibility(true)}><Icon type="plus" />Insert Row</Button>
              </>
            )}
              <Table
                className="db-browse-table"
                columns={column}
                dataSource={data}
                style={{ marginTop: 21 }}
                bordered
                pagination={false}
              />
          </div>
        </div>
      </div>
      {
        isFilterSorterFormVisible && (
          <FilterSorterForm
            visible={isFilterSorterFormVisible}
            handleCancel={() => setFilterSorterFormVisibility(false)}
            filterTable={filterTable}
            schema={colSchema}
          />
        )
      }
      {
        isInsertRowFormVisible && (
          <InsertRowForm
            visible={isInsertRowFormVisible}
            handleCancel={() => setInsertRowFormVisibility(false)}
            insertRow={insertRow}
            schema={colSchema}
          />
        )
      }
      {
        isEditRowFormVisible && (
          <EditRowForm
            visible={isEditRowFormVisible}
            handleCancel={() => setEditRowFormVisibility(false)}
            editRow={editRow}
            selectedDB={selectedDB}
            schema={colSchema}
            data={editRowData}
          />
        )
      }
    </React.Fragment>
  );
};

export default Browse