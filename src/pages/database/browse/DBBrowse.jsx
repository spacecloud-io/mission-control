import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import { set, increment, decrement } from 'automate-redux';
import ReactGA from 'react-ga'

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import FilterSorterForm from "../../../components/database/filter-sorter-form/FilterSorterForm";

import { getProjectConfig, notify } from '../../../utils';
import { Button, Select, Icon } from "antd";
import {API} from "space-api";

const Browse = () => {

  const [modalVisibility, setModalVisibility] = useState(false);
  const { projectID, selectedDB } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    ReactGA.pageview("/projects/database/rules");
  }, [])

  const projects = useSelector(state => state.projects)
  const selectedCol = useSelector(state => state.uiState.selectedCollection)

  const collections = Object.keys(getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections`, {}));
  const dbAlias = getProjectConfig(projects, projectID, `modules.eventing.dbType`);
  
  const api = new API(projectID, "http://localhost:4122");
  const db = api.DB("mysql");
  const data = db.get("users").apply()
  console.log(data)

  // Handlers
  const handleTableChange = col => {
    console.log(col)
  }

  const InsertRow = () => {

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
            <Button size="large" onClick={() => setModalVisibility(true)}>Filters & Sorters <Icon type="filter" /></Button>
            <Button style={{ float: "right" }} type="primary" className="insert-row" ghost onClick={InsertRow}><Icon type="plus" />Insert Row</Button>
          </div>
        </div>
      </div>
      {
        modalVisibility && (
          <FilterSorterForm 
           visible={modalVisibility}
           handleCancel={() => setModalVisibility(false)}
          />
        )
      }
    </React.Fragment>
  );
};

export default Browse