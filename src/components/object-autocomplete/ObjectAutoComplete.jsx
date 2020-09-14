import React, {useState, useEffect} from 'react';
import {AutoComplete} from 'antd';
import dotProp from 'dot-prop-immutable';


let data = [];
const ObjectAutoComplete = (props) => {
  const {options} = props; 
  const [value, setValue] = useState(props.value ? props.value : "");
  useEffect(() => {
    data = Object.keys(options);
  }, [props])

  const changeOptions = path => {
    data = dotProp.get(options, path) ? Object.keys(dotProp.get(options, path)) : Object.keys(options);
  }

  const handleSearch = (val) => {
    setValue(val);
    props.onChange(val);
    const variables = val.split(".");
    let path = "";
    for (let i = 0; i < variables.length - 1; i++) {
      if (i === 0) path += variables[i];
      else path += "." + variables[i];
    }
    changeOptions(path);
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
    >
     {data
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