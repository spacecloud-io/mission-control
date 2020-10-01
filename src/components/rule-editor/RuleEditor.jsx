import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "antd";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/theme/material.css";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/selection/active-line.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/edit/closebrackets.js";
import "./rule-editor.css";
import { notify } from "../../utils";
import useDeepCompareEffect from "use-deep-compare-effect";

const RuleEditor = ({
  rules = {},
  emptyState,
  selectedRuleName = "",
  stringifyRules = true,
  handleSelect,
  canDeleteRules = false,
  handleDelete,
  handleSubmit,
}) => {
  const entries = Object.entries(rules);

  const noOfRules = entries.length;

  const [selectedRule, setSelectedRule] = useState("");
  const [initialRule, setInitialrule] = useState("");

  var unSavedChanges = selectedRule && selectedRule !== initialRule;

  useDeepCompareEffect(() => {
    if (selectedRuleName) {
      let temp = rules[selectedRuleName];
      if (temp) {
        delete temp.id;
        if (stringifyRules) {
          temp = JSON.stringify(temp, null, 2);
        }
        setInitialrule(temp);
        setSelectedRule(temp);
      }
    }
  }, [selectedRuleName, rules]);

  useEffect(() => {
    if (!rules.hasOwnProperty(selectedRuleName) && noOfRules) {
      handleSelect(entries[0][0]);
    }
  }, [rules]);

  const handleDeleteClick = (e, ruleName) => {
    e.stopPropagation();
    handleDelete(ruleName);
  };

  const handleSaveClick = () => {
    try {
      let rule = selectedRule;
      if (stringifyRules) {
        rule = JSON.parse(selectedRule);
      }
      handleSubmit(rule);
    } catch (ex) {
      notify("error", "Error saving", ex.toString());
    }
  };

  return (
    <div className="rule-editor">
      {noOfRules === 0 && emptyState}
      {noOfRules > 0 && (
        <div>
          <Row type="flex">
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={8}
              xl={6}
              className="rule-editor__rule-list"
            >
              {entries.map(([ruleName, obj]) => {
                return (
                  <div
                    className={`rule-editor__rule-item ${
                      selectedRuleName === ruleName
                        ? "rule-editor__rule-item--active"
                        : ""
                    } `}
                    onClick={() => handleSelect(ruleName)}
                  >
                    <span>{ruleName}</span>
                    {canDeleteRules && (
                      <i
                        className="material-icons"
                        onClick={(e) => handleDeleteClick(e, ruleName)}
                      >
                        delete
                      </i>
                    )}
                  </div>
                );
              })}
            </Col>
            <Col xs={24} sm={24} md={24} lg={16} xl={18}>
              <div className="code">
                <CodeMirror
                  value={selectedRule}
                  options={{
                    mode: { name: "javascript", json: true },
                    lineNumbers: true,
                    styleActiveLine: true,
                    matchBrackets: true,
                    autoCloseBrackets: true,
                    tabSize: 2,
                    autofocus: true,
                  }}
                  onBeforeChange={(editor, data, value) => {
                    setSelectedRule(value);
                  }}
                />
              </div>
              <div className="rule-editor__footer">
                <Button
                  type="primary"
                  disabled={!unSavedChanges}
                  onClick={handleSaveClick}
                >
                  Save
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default RuleEditor;
