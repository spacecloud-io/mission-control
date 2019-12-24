import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector, useDispatch } from 'react-redux';
import { get, set, increment, decrement } from 'automate-redux';

import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import SecretConfigure from "../../components/configure/SecretConfigure"
import EventingConfigure from "../../components/configure/EventingConfigure"
import ExportImport from "../../components/configure/ExportImport"
import './configure.css'
import { getProjectConfig, notify, setProjectConfig } from '../../utils';
import client from "../../client"
import { Button } from 'antd';
import store from "../../store";
import history from "../../history"
import Projects from '../../services/projects';
import { dbIcons } from '../../utils';

const Configure = () => {
	// Router params
	const { projectID, selectedDB } = useParams()

	useEffect(() => {
		ReactGA.pageview("/projects/configure");
	}, [])

	const dispatch = useDispatch()

	// Global state
	const projects = useSelector(state => state.projects)
	const selectedProject = projects.find(project => project.id === projectID)

	// Derived properties
	const projectName = getProjectConfig(projects, projectID, "name")
	const secret = getProjectConfig(projects, projectID, "secret")
	const eventing = getProjectConfig(projects, projectID, "modules.eventing", {})
	// changes

	const crudModule = getProjectConfig(projects, projectID, "modules.crud", {})

	const dbList = Object.entries(crudModule).map(([alias, obj]) => {
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

	const removeProjectConfig = () => {
		store.dispatch(increment("pendingRequests"))
		client.projects.deleteProject(projectID).then(() => {
			notify("success", "Success", "Removed project config successfully")
			const extraConfig = store.getState().extraConfig
			const newExtraConfig = delete extraConfig[projectID]
			store.dispatch(set(`extraConfig`, newExtraConfig))
			const projectConfig = store.getState().projects;
			const projectList = projectConfig.filter(project => project.id !== projectID)
			store.dispatch(set(`projects`, projectList))
			history.push(`/mission-control/welcome`)
		})
			.catch(ex => {
				notify("error", "Error removing project config", ex)
			})
			.finally(() => store.dispatch(decrement("pendingRequests")))
	}

	const importProjectConfig = (projectID, config) => {
		dispatch(increment("pendingRequests"))
		client.projects.setProjectConfig(projectID, config)
			.then(() => {
				const updatedProjects = projects.map(project => {
					if (project.id === config.id) {
						project.secret = config.secret;
						project.modules = config.modules;
					}
					return project
				});
				store.dispatch(set("projects", updatedProjects))
				notify("success", "Success", "Updated project config successfully")
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
					<EventingConfigure dbType={eventing.dbType} dbList={dbList} col={eventing.col} handleSubmit={handleEventingConfig} />
					<h2>Export/Import Project Config</h2>
					<div className="divider" />
					<ExportImport projectConfig={selectedProject} importProjectConfig={importProjectConfig} />
					<h2>Delete Project</h2>
					<div className="divider" />
					<p>Removes project config</p>
					<Button type="danger" onClick={removeProjectConfig}>Remove</Button>
				</div>
			</div>
		</div>
	);
}

export default Configure;
