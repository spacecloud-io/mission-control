import React from 'react'

function SidenavItem(props) {
  return (
      <div className={
        props.active ? 'sidenav-item sidenav-item--active' : 'sidenav-item'
      } >
      <i className="material-icons-outlined sidenav-item__icon">{props.icon}</i>
      <span className="sidenav-item__name">{props.name}</span>
    </div>
  )
}

export default SidenavItem;