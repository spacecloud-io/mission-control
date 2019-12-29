import React from "react";
import { Row, Button, Col } from "antd";
import addDb from "../../assets/addDb.svg";
import history from "../../history";
import { useParams } from "react-router-dom";

function DatabaseEmptyState() {
  const { projectID } = useParams();
  return (
    <div className="panel">
      <img src={addDb} />
      <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>
      Space Cloud exposes realtime GraphQL and REST APIs on top of new or existing databases. Add a database to get started.
      </p>
      <Button type="primary action-rounded" style={{ marginTop: 16 }} onClick={() => history.push(`/mission-control/projects/${projectID}/database/add-db`)}>
        Add Database
      </Button>
    </div>
  );
}

export default DatabaseEmptyState;
