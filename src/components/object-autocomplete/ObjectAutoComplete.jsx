import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import dotProp from 'dot-prop-immutable';

const ObjectAutoComplete = (props) => {
  const { options } = props;
  const [value, setValue] = useState(props.value ? props.value : "");

  const getFilteredOptions = () => {
    const variables = value.split(".");
    const path = variables.slice(0, variables.length - 1);

    return dotProp.get(options, path.join(".")) ? Object.keys(dotProp.get(options, path.join("."))) : Object.keys(options);
  }

  const filteredOptions = getFilteredOptions();

  const handleSearch = (val) => {
    setValue(val);
    props.onChange(val);
  }

  const handleSelect = (val) => {
    setValue(value.substring(0, value.lastIndexOf(".") + 1) + val); // Before last dot
    props.onChange(value.substring(0, value.lastIndexOf(".") + 1) + val);
  }
  return (
    <AutoComplete
      placeholder={props.placeholder}
      onSearch={handleSearch}
      onSelect={handleSelect}
      value={value}
      style={props.style}
    >
      {filteredOptions
        .filter(
          (data) =>
            data.toLowerCase().indexOf(value.substring(value.lastIndexOf(".") + 1).toLowerCase()) !== -1 // After last dot
        )
        .map((data) => (
          <AutoComplete.Option key={data} value={data}>
            {data}
          </AutoComplete.Option>
        ))}
    </AutoComplete>
  )
}

export default ObjectAutoComplete;