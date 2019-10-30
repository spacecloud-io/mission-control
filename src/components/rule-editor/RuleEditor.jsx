import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "antd"
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import "./rule-editor.css"
import { notify } from "../../utils";

const RuleEditor = ({ rules = {}, emptyState, sidePanel, selectedRuleName = "", stringifyRules = true, handleClick, canDeleteRules = false, handleDelete, handleSubmit }) => {
  const entries = Object.entries(rules)
  const noOfRules = entries.length

  const [selectedRule, setSelectedRule] = useState("")
  const [initialRule, setInitialrule] = useState("")

  const unSavedChanges = selectedRule && initialRule && selectedRule !== initialRule

  useEffect(() => {
    let temp = rules[selectedRuleName]

    if (stringifyRules) {
      temp = JSON.stringify(temp, null, 2)
    }
    setInitialrule(temp)
    setSelectedRule(temp)
  }, [selectedRuleName, rules])

  useEffect(() => {
    if (!rules[selectedRuleName] && noOfRules) {
      handleClick(entries[0][0])
    }
  }, [rules])

  const handleDeleteClick = (e, ruleName) => {
    e.stopPropagation();
    handleDelete(ruleName)
  }

  const handleSaveClick = () => {
    try {
      let rule = selectedRule
      if (stringifyRules) {
        rule = JSON.parse(selectedRule)
      }
      handleSubmit(rule)
    } catch (ex) {
      notify("error", "Error saving", ex.toString())
    }
  }

  return (
    <div>
      {!noOfRules === 0 && emptyState}
      {(!noOfRules.length > 0) && <div className="rule-editor">
        <Row type="flex">
          <Col span={6}>
            {sidePanel}
          </Col>
          <Col span={6} className="rule-editor__rule-list">
            {entries.map(([ruleName]) => {
              return <div
                className={`rule-editor__rule-item ${selectedRuleName === ruleName ? "rule-editor__rule-item--active" : ""}`}
                onClick={() => handleClick(ruleName)}>
                <span>{ruleName}</span>
                {canDeleteRules && <i className="material-icons" onClick={(e) => handleDeleteClick(e, ruleName)}>delete</i>}
              </div>
            })}
          </Col>
          <Col span={12}>
            <div className='code'>
              <CodeMirror
                value={selectedRule}
                options={{
                  mode: { name: 'javascript', json: true },
                  lineNumbers: true,
                  styleActiveLine: true,
                  matchBrackets: true,
                  autoCloseBrackets: true,
                  tabSize: 2,
                  autofocus: true
                }}
                onBeforeChange={(editor, data, value) => { setSelectedRule(value) }}
              />
            </div>
            <div className="rule-editor__footer">
              <Button type="primary" disabled={!unSavedChanges} onClick={handleSaveClick}>Save</Button>
            </div>
          </Col>
        </Row>
      </div>}
    </div>
  )
}

export default RuleEditor