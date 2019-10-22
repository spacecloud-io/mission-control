import React from 'react';
import './ProjectID.css';
const ProjectID=(name)=>{
    var a=name.name;
  if(a==="" || a===undefined){return <div></div>
      
  }
  else {
      var c=a.toLowerCase();
      var d=c.split(' ').join('_');
      var e=d.split('-').join('_');
    return (
    <div className="ProjId">Project ID:  {e}<div className="tooltip"><i className="material-icons help">help_outline</i><span className="tooltiptext">Unique Identifier for your project</span></div></div>
)}
}
export default ProjectID;