import React from 'react';
import { useParams, } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import EventingConfigure from '../../components/eventing/EventingConfigure';
import './event.css';
import { saveEventingConfig, getEventingConfig } from '../../operations/eventing';
import { getDbConfigs } from '../../operations/database';
import { projectModules, actionQueuedMessage } from '../../constants';

const EventingSettings = () => {
  const { projectID } = useParams();

  // Global state
  const loading = useSelector(state => state.pendingRequests > 0)
  const eventingConfig = useSelector(state => getEventingConfig(state))
  const dbConfigs = useSelector(state => getDbConfigs(state));

  // Derived state
  const dbList = Object.keys(dbConfigs)

  const handleEventingConfig = (config) => {
    incrementPendingRequests()
    saveEventingConfig(projectID, config)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Saved eventing config successfully"))
      .catch(ex => notify("error", "Error saving eventing config", ex))
      .finally(() => decrementPendingRequests());
  };

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.EVENTING} />
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