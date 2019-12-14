import React from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { set } from 'automate-redux';


import { Row, Select } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import QueryWhite from "../../../components/db-query/query-white";
import QueryDark from "../../../components/db-query/query-dark";

import { getProjectConfig } from '../../../utils';

const Queries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const selectedCol = useSelector(state => state.uiState.selectedCollection)

  // Global state
  const projects = useSelector(state => state.projects)

  const dispatch = useDispatch()

  // Derived properties
  const collections = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections`, {})
  const rules = Object.entries(collections).filter(([name]) => name !== "event_logs" && name !== "default").reduce((prev, [name, col]) => Object.assign(prev, { [name]: col.schema }), {})

  // Handlers
  const handleSelect = (colName) => dispatch(set("uiState.selectedCollection", colName))

  const entries = Object.entries(rules)
  const noOfRules = entries.length

  useEffect(() => {
    if (!rules.hasOwnProperty(selectedCol) && noOfRules) {
      handleSelect(entries[0][0])
    }
  }, [rules])

  let value1 = (`query { 
  authors ( 
   where: { id: 1, limit: 1, skip: 0}, 
    ) @postgres { 
     id 
     name 
     posts (where: { author_id: “authors.id” }) @postgres { 
      title 
    } 
  } 
}`)

  let value2 = (`{ 
  "data":{ 
    "authors":[ 
      { 
        "id":1,
        "name":"Archu",
        "posts":[ 
        { title:"Post 1" }
      ]
    }
  ]
 }
}`)

  let value3 = (`mutation { 
  insert_authors ( 
     docs: [{ 
          "id”:"2",
          "name":"Suhail"
        }]      
      ) @postgres { 
        status
     }
  }`)

  let value4 = (`{ 
  "data":{ 
    "insert_authors":{ 
      "status":200
    }
  }
}`)

  let value5 = (`mutation{ 
  delete_authors ( 
     where: { 
      "id":1
     }      
    ) @postgres { 
       status
     }
  }`)

  let value6 = (`{ 
  "data":{ 
    "delete_authors":{ 
      "status":200
    }
  }
}`)

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
            activeKey='queries'
          />
          <div className="db-tab-content">
            <Select value={selectedCol === 'default' || selectedCol === '' ? Object.keys(rules)[0] : selectedCol}>
              {entries.map(([ruleName]) => <Select.Option value={ruleName} onClick={() => handleSelect(ruleName)}>{ruleName}</Select.Option>)}
            </Select>
            <p className="query-font">Queries</p>
            <p className="query-font-small">Fetch records from posts table with filters and pagination:</p>
            <div>
              <Row gutter={48}>
                <div><QueryWhite value={value1} handleSelect={handleSelect} /></div>
                <div><QueryDark value={value2} handleSelect={handleSelect} /></div>
              </Row>
              <p className="query-font">Mutations</p>
              <p className="query-font-small">Insert a new record in posts table:</p>
              <Row gutter={48}>
                <div><QueryWhite value={value3} handleSelect={handleSelect} /></div>
                <div><QueryDark value={value4} handleSelect={handleSelect} /></div>
              </Row>
              <p className="query-font-small" style={{ marginTop: 15 }}>Delete a record from posts table:</p>
              <Row gutter={48} style={{ marginBottom: 25 }}>
                <div><QueryWhite value={value5} handleSelect={handleSelect} /></div>
                <div><QueryDark value={value6} handleSelect={handleSelect} /></div>
              </Row>
              <div />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Queries