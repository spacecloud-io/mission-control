import React, { useEffect } from 'react';
import { useParams, } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactGA from 'react-ga';
import { getProjectConfig, dbIcons, notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import EventingConfigure from '../../components/eventing/EventingConfigure';
import './event.css';
import { saveEventingConfig } from '../../operations/eventing';

const EventingSettings = () => {
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/eventing/settings");
  }, [])

  // Global state
  const projects = useSelector(state => state.projects);

  const eventing = getProjectConfig(
    projects,
    projectID,
    "modules.eventing",
    {}
  );

  const dbModule = getProjectConfig(projects, projectID, "modules.db", {});

  const dbList = Object.entries(dbModule).map(([alias, obj]) => {
    if (!obj.type) obj.type = alias;
    return {
      alias: alias,
      dbtype: obj.type,
      svgIconSet: dbIcons(alias)
    };
  });

  const handleEventingConfig = (dbAlias) => {
    incrementPendingRequests()
    saveEventingConfig(projectID, true, dbAlias)
      .then(() => notify("success", "Success", "Changed eventing config successfully"))
      .catch(ex => notify("error", "Error changing eventing config", ex))
      .finally(() => decrementPendingRequests());
  };

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="eventing" />
      <div className='page-content page-content--no-padding'>
        <EventTabs activeKey="settings" projectID={projectID} />
        <div className="event-tab-content">
          <h2>Eventing Config</h2>
          <div className="divider" />
          <EventingConfigure
            dbType={eventing.dbAlias}
            dbList={dbList}
            handleSubmit={handleEventingConfig}
          />
        </div>
      </div>
    </div>
  );
}

export default EventingSettings;