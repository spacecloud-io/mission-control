import React from "react"
import { Link } from "react-router-dom"
import EmptyState from '../../../components/rules/EmptyState';
import rulesImg from '../../../assets/rules.svg';

const TableEmptyState = ({ projectId, dbType, handleAdd }) => {
  const buttonText = dbType === 'mongo' ? 'Add a collection' : 'Create a table'
  const rulesTabURL = `/mission-control/projects/${projectId}/database/rules/${dbType}`
  const desc = <p>There are no tracked {dbType === 'mongo' ? 'collections' : 'tables'}. <Link to={rulesTabURL}>Default rules</Link> will be applied</p>
  return <EmptyState
    graphics={rulesImg}
    desc={desc}
    buttonText={buttonText}
    handleClick={handleAdd}
  />
}

export default TableEmptyState