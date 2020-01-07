import React, { useState } from "react";
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
import gql from 'graphql-tag';
import gqlPrettier from 'graphql-prettier';
import { format } from 'prettier-package-json';
import { getProjectConfig, getType, getFields, getFieldsValues, getVariables } from '../../../utils';

const Queries = () => {
  var index = [];

  const [selectedRule, setSelectedRule] = useState()

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
    let temp = rules[selectedCol]
    setSelectedRule(temp)
  }, [selectedCol, rules])

  useEffect(() => {
    if (!rules.hasOwnProperty(selectedCol) && noOfRules) {
      handleSelect(entries[0][0])
    }
  }, [rules])

  // build the index
  for (var x in rules) { index.push(x); }
  // sort the index
  index.sort(function (a, b) { return a == b ? 0 : (a > b ? 1 : -1); });

  function removeComma(value) {
    let removeOpeningComma = /\,(?=\s*?[\{\]])/g;
    let removeClosingComma = /\,(?=\s*?[\}\]])/g;
    value = value.replace(removeOpeningComma, '');
    value = value.replace(removeClosingComma, '');
    value = format(JSON.parse(value))
    return value
  }


  if (selectedRule !== undefined)
    var query = gql(selectedRule)
  if (query !== undefined) {

    console.log(`query { 
      ${getType(query)} @mysql {
        ${getFields(query, rules, index)}  }
}`);
    var value1 = gqlPrettier(`query { 
      ${getType(query)} @mysql {
        ${getFields(query, rules, index)}  }
}`)

    var value2 = removeComma(`{ 
    "data": { 
      "insert_${getType(query)}": {
        "returning": [
          { 
           ${getFieldsValues(query, rules, index)}       
          }
        ],
        "status": 200
      }
    }
  }`)

    var value3 = gqlPrettier(`mutation { 
  insert_${getType(query)} ( 
     docs: [{${getVariables(query, rules, index)}}]   
  ) @mysql {
    status
    error
    returning {
      ${getFields(query, rules, index)}
    }
  }
}`)

    var value4 = removeComma(`{ 
  "data":{ 
    "insert_${getType(query)}":{ 
      "returning": [{ 
        ${getFieldsValues(query, rules, index)}    
      }],
      "status": 200
    }
  }
}`)

    var value5 = gqlPrettier(`mutation { 
  delete_${getType(query)} ( 
     where: {${getVariables(query, rules, index)}}      
    ) @mysql { 
       status
       }
     
  }`)

    var value6 = removeComma(`{ 
  "data":{ 
    "delete_${getType(query)}":{ 
      "status":200
    }
  }
}`)
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