import React, { useEffect } from 'react';
import { useParams, } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get, set, increment, decrement } from "automate-redux";
import ReactGA from 'react-ga';
import { getProjectConfig, dbIcons, notify, setProjectConfig } from '../../utils';
import client from '../../client';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import EventingConfigure from '../../components/eventing/EventingConfigure';
import './event.css';

const EventingSettings = () => {
    const { projectID } = useParams();
    const dispatch = useDispatch();

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

    const crudModule = getProjectConfig(projects, projectID, "modules.crud", {});

    const dbList = Object.entries(crudModule).map(([alias, obj]) => {
        if (!obj.type) obj.type = alias;
        return {
        alias: alias,
        dbtype: obj.type,
        svgIconSet: dbIcons(projects, projectID, alias)
        };
    });

    const handleEventingConfig = (dbAlias) => {
        dispatch(increment("pendingRequests"));
        client.eventing
          .setEventingConfig(projectID, { enabled: true, dbAlias })
          .then(() => {
            setProjectConfig(projectID, "modules.eventing.dbAlias", dbAlias);
            notify("success", "Success", "Changed eventing config successfully");
          })
          .catch(ex => notify("error", "Error", ex))
          .finally(() => dispatch(decrement("pendingRequests")));
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