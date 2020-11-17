import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import { set } from 'automate-redux';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import FilterSorterForm from "../../../components/database/filter-sorter-form/FilterSorterForm";
import InsertRowForm from "../../../components/database/insert-row-form/InsertRowForm";
import EditRowForm from "../../../components/database/edit-row-form/EditRowForm";
import InfiniteScrollingTable from "../../../components/utils/infinite-scrolling-table/InfiniteScrollingTable";

import { notify, incrementPendingRequests, decrementPendingRequests } from '../../../utils';
import { generateSchemaAST } from "../../../graphql";
import { Button, Select, Popconfirm } from "antd";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { API, cond } from "space-api";
import { spaceCloudClusterOrigin, projectModules } from "../../../constants"
import { getCollectionSchema, getDbType, getTrackedCollections } from '../../../operations/database';
import { getAPIToken } from '../../../operations/projects';

const pageSize = 25;
let editRowData = {};

const getUniqueKeys = (colSchemaFields = []) => {
  return colSchemaFields.filter(val => val.isPrimary || val.hasUniqueConstraint).map(val => val.name)
}

const Browse = () => {

  const [isFilterSorterFormVisible, setFilterSorterFormVisibility] = useState(false);
  const [isInsertRowFormVisible, setInsertRowFormVisibility] = useState(false);
  const [isEditRowFormVisible, setEditRowFormVisibility] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { projectID, selectedDB } = useParams()
  const dispatch = useDispatch()

  const selectedDBType = useSelector(state => getDbType(state, selectedDB))
  const selectedCol = useSelector(state => state.uiState.selectedCollection)
  const filters = useSelector(state => state.uiState.explorer.filters);
  const sorters = useSelector(state => state.uiState.explorer.sorters);
  const collectionSchemaString = useSelector(state => getCollectionSchema(state, selectedDB, selectedCol))
  const collections = useSelector(state => getTrackedCollections(state, selectedDB))
  const internalToken = useSelector(state => getAPIToken(state))
  const api = new API(projectID, spaceCloudClusterOrigin);
  api.setToken(internalToken)
  const db = api.DB(selectedDB);
  const colSchemaFields = generateSchemaAST(collectionSchemaString)[selectedCol];
  const uniqueKeys = getUniqueKeys(colSchemaFields)

  // Auto select first collection if no collection is selected
  useEffect(() => {
    if (collections.length > 0 && !selectedCol) {
      dispatch(set("uiState.selectedCollection", collections[0]))
    }
  }, [selectedCol, collections])

  const getTableData = (previousData = [], fetchSinceStart = true) => {
    return new Promise((resolve, reject) => {
      const filterConditions = filters.map(obj => cond(obj.column, obj.operation, obj.value));
      const sortConditions = sorters.map(obj => obj.order === "descending" ? `-${obj.column}` : obj.column);

      db.get(selectedCol)
        .where(...filterConditions)
        .sort(...sortConditions)
        .limit(pageSize)
        .skip(fetchSinceStart ? 0 : previousData.length)
        .apply()
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            notify("error", "Error fetching data", data.error);
            reject(data.error)
            return
          }

          data.result.forEach(obj => {
            Object.entries(obj).forEach(([key, value]) => {
              // Stringifying certain data types to render them in table 
              if (typeof value === "boolean") {
                obj[key] = value.toString()
                return
              }
              if (typeof value === "object" && !Array.isArray(value) && value !== null) {
                obj[key] = JSON.stringify(value, null, 2)
                return
              }
              if (typeof value === "object" && Array.isArray(value) && value !== null) {
                obj[key] = value.toString()
              }
            })
          })

          const moreDataToFetch = data.result.length < pageSize ? false : true
          setHasMore(moreDataToFetch)
          setTableData(fetchSinceStart ? data.result : [...previousData, ...data.result])
          resolve()
        })
        .catch(ex => {
          notify("error", "Error fetching data", ex)
          reject()
        })
    })
  }

  // Get all the possible columns for the table based on the schema and data fetched
  const getColumnNames = (colSchemaFields = [], data = []) => {
    const dataFields = data.length > 0 ? Object.keys(data[0]) : []
    const schemaFields = colSchemaFields.map(obj => obj.name)
    const fields = [...new Set([...dataFields, ...schemaFields])]
    const fieldColumns = fields.map((name) => ({ key: name, title: name, dataIndex: name, ellipsis: true }))
    const actionColumn = {
      key: "action",
      render: (record) => {
        return (
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
      }
    }
    if (data.length > 0) return [actionColumn, ...fieldColumns]
    return fieldColumns
  }

  // Fetch data whenever filters, sorters or selected column is changed
  useEffect(() => {
    if (selectedCol) {
      getTableData();
    }
  }, [filters, sorters, selectedCol])


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
    return new Promise((resolve, reject) => {
      let doc = {};
      for (let row of values) {
        doc[row.column] = row.value;
      }

      incrementPendingRequests()
      db.insert(selectedCol).doc(doc).apply()
        .then(res => {
          if (res.status < 200 || res.status >= 300) {
            notify("error", "Error inserting row", res.data.error);
            reject()
            return;
          }
          notify("success", "Success", "Successfully inserted a row!");
          resolve()
          getTableData();
        })
        .catch(ex => {
          notify("error", "Error inserting row", ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }

  const deleteRow = (record) => {
    const conditions = uniqueKeys.map(key => cond(key, "==", record[key]))
    incrementPendingRequests()
    db.delete(selectedCol)
      .where(...conditions)
      .apply()
      .then((res) => {
        if (res.status < 200 || res.status >= 300) {
          notify("error", "Error deleting row", res.data.error)
          return;
        }
        notify("success", "Success", "Row deleted successfully")
        getTableData();
      })
      .catch(ex => notify("error", "Error deleting row", ex))
      .finally(() => decrementPendingRequests())
  }

  const editRow = values => {
    const conditions = uniqueKeys.map(key => cond(key, "==", editRowData[key]))
    const updateOperation = db.update(selectedCol).where(...conditions);
    let set = {};
    let remove = [];
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
          remove.push(row.column)
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
      updateOperation.set(set);
    }

    if (remove.length !== 0) {
      updateOperation.remove(...remove);
    }

    if (Object.keys(rename).length !== 0) {
      updateOperation.rename(rename);
    }

    if (Object.keys(inc).length !== 0) {
      updateOperation.inc(inc);
    }

    if (Object.keys(mul).length !== 0) {
      updateOperation.mul(mul);
    }

    if (Object.keys(min).length !== 0) {
      updateOperation.min(min);
    }

    if (Object.keys(max).length !== 0) {
      updateOperation.max(max);
    }

    if (Object.keys(push).length !== 0) {
      updateOperation.push(push);
    }

    if (currentDate.length !== 0) {
      currentDate.forEach(val => {
        updateOperation.currentDate(val);
      })
    }

    if (currentTimestamp.length !== 0) {
      currentTimestamp.forEach(val => {
        updateOperation.currentTimestamp(val);
      })
    }

    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      updateOperation.apply()
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            notify("error", "Error updating row", data.error);
            reject()
            return;
          }
          notify("success", "Success", "Row updated successfully!");
          resolve()
          getTableData();
        })
        .catch(ex => {
          notify("error", "Error updating row", ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }

  const tableColumns = getColumnNames(colSchemaFields, tableData)
  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem={projectModules.DATABASE} />
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
              value={selectedCol ? selectedCol : collections.length > 0 ? collections[0] : undefined}
            >
              {collections.map(col => <Select.Option value={col}>{col}</Select.Option>)}
            </Select>
            {colSchemaFields && (
              <>
                <Button onClick={() => setFilterSorterFormVisibility(true)}>Filters & Sorters <FilterOutlined /></Button>
                <Button style={{ float: "right" }} type="primary" className="insert-row" ghost onClick={() => setInsertRowFormVisibility(true)}><PlusOutlined />Insert Row</Button>
              </>
            )}
            <InfiniteScrollingTable
              id="db-browse-table"
              hasMore={hasMore}
              loadNext={(previousData) => getTableData(previousData, false)}
              className="db-browse-table"
              columns={tableColumns}
              dataSource={tableData}
              scrollHeight={600}
              style={{ marginTop: 21 }}
              bordered
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
            schema={colSchemaFields}
          />
        )
      }
      {
        isInsertRowFormVisible && (
          <InsertRowForm
            visible={isInsertRowFormVisible}
            handleCancel={() => setInsertRowFormVisibility(false)}
            insertRow={insertRow}
            schema={colSchemaFields.filter(val => !val.isLink)}
          />
        )
      }
      {
        isEditRowFormVisible && (
          <EditRowForm
            visible={isEditRowFormVisible}
            handleCancel={() => setEditRowFormVisibility(false)}
            editRow={editRow}
            selectedDB={selectedDBType}
            schema={colSchemaFields.filter(val => !val.isLink)}
            data={editRowData}
          />
        )
      }
    </React.Fragment>
  );
};

export default Browse