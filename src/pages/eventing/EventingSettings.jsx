import React, { useEffect } from 'react';
import { useParams, } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactGA from 'react-ga';
import { dbIcons, notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import EventingConfigure from '../../components/eventing/EventingConfigure';
import './event.css';
import { saveEventingConfig, getEventingConfig } from '../../operations/eventing';
import { getDbsConfig } from '../../operations/database';

const EventingSettings = () => {
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/eventing/settings");
  }, [])

  // Global state
  const loading = useSelector(state => state.pendingRequests > 0)
  const eventingConfig = useSelector(state => getEventingConfig(state))
  const dbsConfig = useSelector(state => getDbsConfig(state));

  // Derived state
  const dbList = Object.entries(dbsConfig).map(([alias, obj]) => {
    if (!obj.type) obj.type = alias;
    return {
      alias: alias,
      dbtype: obj.type,
      svgIconSet: dbIcons(alias)
    };
  });

  const handleEventingConfig = ({ enabled, dbAlias }) => {
    incrementPendingRequests()
    saveEventingConfig(projectID, enabled, dbAlias)
      .then(() => notify("success", "Success", "Saved eventing config successfully"))
      .catch(ex => notify("error", "Error saving eventing config", ex))
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
            initialValues={eventingConfig}
            dbList={dbList}
            loading={loading}
            handleSubmit={handleEventingConfig}
          />
        </div>
      </div>
    </div >
  );
}

export default EventingSettings;