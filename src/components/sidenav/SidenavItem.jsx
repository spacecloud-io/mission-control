import React from 'react'

function SidenavItem(props) {
  return (
      <div className={
        props.active ? 'item active' : 'item'
      } >
      <i className="material-icons-outlined">{props.icon}</i>
      <span id="itemName">{props.name}</span>
    </div>
  )
}

export default SidenavItem;