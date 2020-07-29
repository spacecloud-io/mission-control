import React, { useState, useEffect } from "react";
import { Table } from "antd";
import "./infinite-scrolling-table.css"

// NOTE: we have to use global state, as the values inside the onScroll function were never getting updated. 
// We had no choice but to do this shit. It feels hacky, but it works and shouldn't be touched. That's how life sometimes is!
let globalState = {
  dataSource: [],
  hasMore: false
}

// Infinite scrolling wrapper over ant design table.
// NOTE: This requires an id in prop to work
function InfiniteScrollingTable({ id, hasMore, loadNext, scrollHeight = 720, ...tableProps }) {
  const [tableBody, setTableBody] = useState(null)
  const [loading, setLoading] = useState(false)

  globalState.dataSource = tableProps.dataSource;
  globalState.hasMore = hasMore

  const onScroll = (event) => {
    const maxScroll = event.target.scrollHeight - event.target.clientHeight;
    const currentScroll = event.target.scrollTop
    if (maxScroll === currentScroll) {
      if (!loading && globalState.hasMore && loadNext) {
        setLoading(true)
        loadNext(globalState.dataSource)
          .finally(() => setLoading(false))
      }
    }
  }

  // Hook to attach a scroll listener to the ant table body
  // NOTE: We had to use multiple stages of document.querySelector since the querySelector only worked on immediate descendants. Don't know why but this is true.
  // NOTE: The dependency array is empty here because we couldn't found a reliable dependency array for this. On mount, the table body we recieved was null. 
  useEffect(() => {
    const tableElement = document.querySelector(`#${id}`)
    if (tableElement) {
      const tableBodyContainer = tableElement.querySelector(".ant-table-container")
      if (tableBodyContainer) {
        const tableBodyElement = tableBodyContainer.querySelector(".ant-table-body")
        if (tableBodyElement) {
          tableBodyElement.addEventListener("scroll", onScroll)
          setTableBody(tableBodyElement)
        }
      }
    }
  }, [globalState.dataSource.length === 0])

  // Hook to remove the scroll listener.
  // Since there was no dependency array to the hook attaching the scroll listener, onComponentUnmount is the only valid place to remove the listener 
  useEffect(() => {
    // No need of doing anything here
    return () => {
      if (tableBody) {
        tableBody.removeEventListener("scroll", onScroll)
      }
    }
  }, [])

  // Check if id field is provided in the props.
  // id field is used while adding an event listener.
  if (!id) {
    console.error("`id` is required by the InfiniteScrollingTable")
    return null
  }

  const { className = "", ...restTableProps } = tableProps
  const finalClassName = className + " infinite-scrolling-table"

  return (
    <Table
      {...restTableProps}
      id={id}
      className={finalClassName}
      scroll={{ y: scrollHeight, scrollToFirstRowOnChange: true }}
      pagination={false}
      loading={loading} />
  )
}

export default InfiniteScrollingTable;