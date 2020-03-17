import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { connect } from 'react-redux';
import { get, set } from 'automate-redux';
import jwt from 'jsonwebtoken';
import client from '../../../client';
import * as templates from '../templates.js';
import { SPACE_CLOUD_USER_ID } from '../../../constants';
import ReactGA from 'react-ga';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import Header from '../../../components/header/Header';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { Checkbox, Input, Select, Button, Tooltip, Icon, Tag } from 'antd';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import '../explorer.css';
import { notify, getProjectConfig } from '../../../utils';
import ExplorerTabs from "../../../components/explorer/explorer-tabs/ExplorerTabs"
import GenerateTokenForm from "../../../components/explorer/generateToken/GenerateTokenForm"

const { Option } = Select;

const generateAdminToken = secret => {
    return jwt.sign({ id: SPACE_CLOUD_USER_ID }, secret);
};

const SpaceApi = props => {
    const { projectID } = useParams();
    const [loading, setLoading] = useState(null);
    const [response, setResponse] = useState(null);

    const [generateTokenModal, setGenerateTokenModal] = useState(false)

    useEffect(() => {
        ReactGA.pageview("/projects/explorer/spaceApi");
    }, [])

    const getToken = () => {
        return props.useAdminToken ? generateAdminToken(props.secret) : props.userToken
    }

    const generateToken = (data) => {
        var generatedToken = jwt.sign(JSON.stringify(data), props.secret)
        props.setUserToken(generatedToken);
        props.setPayload(data)
    }

    const applyRequest = () => {
        let code = props.spaceApiQuery;
        if (
            code.includes('db.beginBatch') ||
            code.includes('uploadFile') ||
            code.includes('api.Service') ||
            code.includes('liveQuery')
        ) {
            notify(
                'info',
                'Not supported',
                'Explorer does not support all APIs provided by Space Cloud. It supports only basic CRUD operations and function calls.'
            );
            return;
        }

        setLoading(true);
        client
            .execSpaceAPI(props.projectId, code, getToken())
            .then(res => {
                setResponse(res);
            })
            .catch(ex => {
                setResponse(null);
                notify('error', 'Something went wrong', ex);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="explorer">
            <Topbar showProjectSelector />
            <Sidenav selectedItem='explorer' />
            <div className='page-content page-content--no-padding'>
                <ExplorerTabs activeKey="spaceApi" projectID={projectID} />
                <div style={{ padding: "32px 32px 0" }}>
                    <div className="spaceapi">
                        <div className='row'>
                            Trigger requests to Space Cloud directly by coding below. No
                            need to setup any frontend project. (Note: Only javascript code
                            is allowed below.) The <code>api</code> object is available in
                            all requests.
                        </div>
                        <div className='row'>
                            <Checkbox
                                checked={props.useAdminToken}
                                onChange={e =>
                                    props.setUseAdminToken(e.target.checked)
                                }
                            >
                                Use admin token
                            </Checkbox>
                            <Tooltip
                                placement='bottomLeft'
                                title='Use an admin token generated by Space Cloud to bypass all security rules for this request '
                            >
                                <Icon
                                    type='info-circle'
                                    style={{ color: 'rgba(0,0,0,.45)' }}
                                />
                            </Tooltip>
                        </div>
                        {!props.useAdminToken && (
                            <div className='row' style={{ display: "flex" }}>
                                <Input.Password
                                    placeholder='JWT Token'
                                    value={props.userToken}
                                    onChange={e => props.setUserToken(e.target.value)}
                                />
                                <Button type="primary" style={{ background: "#F8F8F8", color: "black", border: "1px solid #D9D9D9" }} onClick={() => setGenerateTokenModal(true)}>
                                    Generate Token
                                </Button>
                            </div>
                        )}
                        <div className='row'>
                            <CodeMirror
                                value={props.spaceApiQuery}
                                options={{
                                    mode: { name: 'javascript', json: true },
                                    lineNumbers: true,
                                    styleActiveLine: true,
                                    matchBrackets: true,
                                    autoCloseBrackets: true,
                                    tabSize: 2,
                                    autofocus: true
                                }}
                                onBeforeChange={(editor, data, value) => {
                                    props.handleSpaceApiQueryChange(value);
                                }}
                            />
                        </div>
                        <div className='row apply-container'>
                            <Select
                                value={props.selectedTemplate}
                                style={{ minWidth: '240px' }}
                                showSerach={true}
                                onChange={template => {
                                    props.setSelectedTemplate(template);
                                    props.handleSpaceApiQueryChange(
                                        templates[template + 'Template']
                                    );
                                }}
                                placeholder='Pick a Template'
                            >
                                <Option value='insert'>Insert Document</Option>
                                <Option value='get'>Get documents</Option>
                                <Option value='call'>Call a function</Option>
                            </Select>
                            <Button type='primary' onClick={applyRequest} loading={loading}>
                                Apply
                            </Button>
                        </div>
                        {loading === false && response && (
                            <div className='row'>
                                <h3>
                                    Status:{' '}
                                    <Tag
                                        color={response.status === 200 ? '#4F8A10' : '#D8000C'}
                                    >
                                        {response.status}
                                    </Tag>
                                </h3>
                                <h3>Result: </h3>
                                <div className='result'>
                                    <CodeMirror
                                        value={JSON.stringify(response.data, null, 2)}
                                        options={{
                                            mode: { name: 'javascript', json: true },
                                            tabSize: 2,
                                            readOnly: true
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {generateTokenModal && <GenerateTokenForm
                    handleCancel={() => setGenerateTokenModal(false)}
                    handleSubmit={generateToken}
                    payloadObject={props.payload}
                    initialToken={getToken()}
                    secret={props.secret}
                />}
            </div>
        </div>
    )

}

const mapStateToProps = (state, ownProps) => {
    const projectId = ownProps.match.params.projectID
    return {
        secret: getProjectConfig(state.projects, projectId, "secret"),
        projectId: projectId,
        selectedTemplate: get(state, 'uiState.explorer.spaceApi.selectedTemplate'),
        spaceApiQuery: get(
            state,
            'uiState.explorer.spaceApi.query',
            templates.defaultTemplate
        ),
        useAdminToken: get(
            state,
            'uiState.explorer.useAdminToken',
            true
        ),
        userToken: get(state, 'uiState.explorer.userToken'),
        payload: get(state, 'uiState.explorer.payload', {})
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setSelectedTemplate: template => {
            dispatch(set('uiState.explorer.spaceApi.selectedTemplate', template));
        },
        handleSpaceApiQueryChange: query => {
            dispatch(set('uiState.explorer.spaceApi.query', query));
        },
        setUseAdminToken: (useAdminToken) => {
            dispatch(set('uiState.explorer.useAdminToken', useAdminToken))
        },
        setUserToken: (userToken) => {
            dispatch(set('uiState.explorer.userToken', userToken))
        },
        setPayload: (payload) => {
            dispatch(set('uiState.explorer.payload', payload))
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SpaceApi);