import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector, useDispatch } from 'react-redux';
import { get, set, increment, decrement } from 'automate-redux';

import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import SecretConfigure from "../../components/configure/SecretConfigure"
import EventingConfigure from "../../components/configure/EventingConfigure"
import './configure.css'
import { getProjectConfig, notify, setProjectConfig } from '../../utils';
import client from "../../client"
import { dbIcons } from '../../utils';

const Configure = () => {
	// Router params
	const { projectID } = useParams()

	useEffect(() => {
		ReactGA.pageview("/projects/configure");
	}, [])

	const dispatch = useDispatch()

	// Global state
	const projects = useSelector(state => state.projects)

	// Derived properties
	const projectName = getProjectConfig(projects, projectID, "name")
	const secret = getProjectConfig(projects, projectID, "secret")
	const eventing = getProjectConfig(projects, projectID, "modules.eventing", {})
	// changes

	const crudModule = getProjectConfig(projects, projectID, "modules.crud", {})

	const dropArray = Object.entries(crudModule).map(([alias, obj]) => {
		if (!obj.type) obj.type = alias
		return { alias: alias, dbtype: obj.type, svgIconSet: dbIcons(projects, projectID, alias) }
	})

	// Handlers
	const handleSecret = (secret) => {
		dispatch(increment("pendingRequests"))
		client.projects.setProjectGlobalConfig(projectID, { secret, id: projectID, name: projectName })
			.then(() => {
				setProjectConfig(projects, projectID, "secret", secret)
				notify("success", "Success", "Changed JWT secret successfully")
			})
			.catch(ex => notify("error", "Error", ex))
			.finally(() => dispatch(decrement("pendingRequests")))
	}

	const handleEventingConfig = (dbType, col) => {
		dispatch(increment("pendingRequests"))
		client.eventTriggers.setEventingConfig(projectID, { enabled: true, dbType, col })
			.then(() => {
				setProjectConfig(projects, projectID, "modules.eventing.dbType", dbType)
				setProjectConfig(projects, projectID, "modules.eventing.col", col)
				notify("success", "Success", "Changed eventing config successfully")
			})
			.catch(ex => notify("error", "Error", ex))
			.finally(() => dispatch(decrement("pendingRequests")))
	}

	return (
		<div className="configure-page">
			<Topbar showProjectSelector />
			<div>
				<Sidenav selectedItem="configure" />
				<div className="page-content">
					<h2>JWT Secret</h2>
					<div className="divider" />
					<SecretConfigure secret={secret} handleSubmit={handleSecret} />
					<h2>Eventing Config</h2>
					<div className="divider" />
					<EventingConfigure dbType={eventing.dbType} dropDown={dropArray} col={eventing.col} handleSubmit={handleEventingConfig} />
				</div>
			</div>
		</div>
	);
}

export default Configure;
