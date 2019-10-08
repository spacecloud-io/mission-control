import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { Divider } from 'antd';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import Header from '../../components/header/Header';
import SecretConfigure from '../../components/configure/SecretConfigure';
import EventingConfigure from '../../components/configure/EventingConfigure';
import FileStorage from '../../components/configure/FileStorageConfigure';
import StaticConfigure from '../../components/configure/StaticConfigure';
import { get, set } from 'automate-redux';
import store from ".././../store";
import './configure.css'
import '../../index.css'

function Rules(props) {
	useEffect(() => {
		ReactGA.pageview("/projects/configure");
	}, [])
	return (
		<div className="configurations">
			<Topbar showProjectSelector />
			<div className="flex-box">
				<Sidenav selectedItem="configure" />
				<div className="page-content">
					<Header name="Project Configurations" color="#000" fontSize="22px" />
					<SecretConfigure formState={props.secret} handleChange={props.handleSecretChange} />
					<Divider />
					<FileStorage formState={props.fileStorage} handleChange={props.handleFileStorageChange} />
					<Divider />
					<EventingConfigure formState={props.eventing} handleChange={props.handleEventingChange} />
					<Divider />
					<StaticConfigure formState={props.static} handleChange={props.handleStaticChange} />
				</div>
			</div>
		</div>
	);
}

const mapStateToProps = (state, ownProps) => {
	return {
		secret: get(state, "config.secret"),
		fileStorage: get(state, "config.modules.fileStore", {}),
		eventing: get(state, "config.modules.eventing", {}),
		static: get(state, "config.modules.static", {})
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		handleSecretChange: (value) => {
			dispatch(set("config.secret", value))
		},
		handleFileStorageChange: (value) => {
			const config = get(store.getState(), "config.modules.fileStore", {})
			dispatch(set("config.modules.fileStore", Object.assign({}, config, value)))
		},
		handleEventingChange: (value) => {
			const config = get(store.getState(), "config.modules.eventing", {})
			dispatch(set("config.modules.eventing", Object.assign({}, config, value)))
		},
		handleStaticChange: (value) => {
			const config = get(store.getState(), "config.modules.static", {})
			dispatch(set("config.modules.static", Object.assign({}, config, value)))
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Rules);
