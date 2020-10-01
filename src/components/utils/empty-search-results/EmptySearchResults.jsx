import React from "react"
import { Empty } from "antd"
import { SearchOutlined } from '@ant-design/icons'

function EmptySearchResults({ searchText }) {
  return (
    <Empty
      image={<SearchOutlined style={{ fontSize: '64px', opacity: '25%' }} />}
      description={
        <p style={{ marginTop: '-30px', opacity: '50%' }}>
          {searchText && <span>
            No search result found for <b>'{searchText}'</b></span>
          }
          {!searchText && <span>
            No search result found for applied filters</span>
          }
        </p>
      } />
  )
}

export default EmptySearchResults;