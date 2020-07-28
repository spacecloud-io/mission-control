import React, { useState, useEffect } from "react";
import { Table } from "antd";
import "./infinite-scrolling-table.css"

let globalState = {
  currentPage: 0,
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
        const nextPage = globalState.currentPage + 1
        loadNext(nextPage, globalState.dataSource)
          .then(() => globalState.currentPage = nextPage)
          .finally(() => setLoading(false))
      }
    }
  }

  // Hook to attach a scroll listener to the ant table body
  // On scroll check if the user has scrolled to the bottom to call loadNext function
  // NOTE: We had to use multiple stages of document.querySelector since the querySelector only worked on immediate descendants. Don't know why but this is true.
  // NOTE: The dependency array is empty here because we couldn't found a reliable dependency array for this. On mount, the table body we recieved was null. 
  useEffect(() => {
    if (!tableBody) {
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
    }
  })

  // Hook to remove the scroll listener.
  // Since there was no dependecy array to the hook attaching the scroll listener, onComponentUnmount is the only valid place to remove the listener 
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