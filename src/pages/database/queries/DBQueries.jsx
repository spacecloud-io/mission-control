import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { set } from 'automate-redux';

import { Row, Select } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import QueryBlock from "../../../components/db-query/QueryBlock";
import gql from 'graphql-tag';
import gqlPrettier from 'graphql-prettier';
import { format } from 'prettier-package-json';
import { getProjectConfig, getType, getFields, getFieldsValues, getVariables, getQueryVariable } from '../../../utils';

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

  // Removes all redundant Comma and Quotes
  function removeRegex(value, dataresponse) {
    let removeOpeningComma = /\,(?=\s*?[\{\]])/g;
    let removeClosingComma = /\,(?=\s*?[\}\]])/g;
    let removeQuotes = /"([^"]+)":/g;
    value = value.replace(removeOpeningComma, '');
    value = value.replace(removeClosingComma, '');
    if (dataresponse) value = format(JSON.parse(value))
    else value = value.replace(removeQuotes, '$1:')
    return value
  }

  if (selectedRule !== undefined)
    var query = gql(selectedRule)
  if (query !== undefined) {

    var value1 = gqlPrettier(removeRegex(`query { 
      ${getType(query)} (where: {${getQueryVariable(query)}}) @${selectedDB} {
        ${getFields(query, rules, index)}  }
    }`, 0))

    var value2 = removeRegex(`
    {
      "data": {
        "authors": [
          {
            ${getFieldsValues(query, rules, index)}       
          }
        ]
      }
    }`, 1)

    var value3 = gqlPrettier(removeRegex(`mutation { 
    insert_${getType(query)} (docs: [{${getFieldsValues(query, rules, index)}}]) @${selectedDB} {
    status
    error
    returning {
      ${getFields(query, rules, index)}
        }
      }
    }`, 0))

    var value4 = removeRegex(`{ 
    "data":{ 
      "insert_${getType(query)}":{ 
        "returning": [{ 
          ${getFieldsValues(query, rules, index)}    
          }],
        "status": 200
        }
      }
    }`, 1)

    var value5 = gqlPrettier(removeRegex(`mutation { 
    delete_${getType(query)} ( 
      where: {${getFieldsValues(query, rules, index)}}) @${selectedDB} { 
       status
       error
       }
    }`, 0))

    var value6 = removeRegex(`{ 
    "data":{   
      "delete_${getType(query)}":{ 
        "status":200
        }
      }
    }`, 1)
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
                <div><QueryBlock value={value1} handleSelect={handleSelect} /></div>
                <div><QueryBlock theme="dark" value={value2} handleSelect={handleSelect} /></div>
              </Row>
              <p className="query-font">Mutations</p>
              <p className="query-font-small">Insert a new record in posts table:</p>
              <Row gutter={48}>
                <div><QueryBlock value={value3} handleSelect={handleSelect} /></div>
                <div><QueryBlock theme="dark" value={value4} handleSelect={handleSelect} /></div>
              </Row>
              <p className="query-font-small" style={{ marginTop: 15 }}>Delete a record from posts table:</p>
              <Row gutter={48} style={{ marginBottom: 25 }}>
                <div><QueryBlock value={value5} handleSelect={handleSelect} /></div>
                <div><QueryBlock theme="dark" value={value6} handleSelect={handleSelect} /></div>
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