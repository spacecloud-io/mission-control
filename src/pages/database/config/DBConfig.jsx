import React, { useState } from 'react';
import { connect } from 'react-redux';
import { get, set } from 'automate-redux';


import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';

import '../database.css';

//antd
import { Button, Tooltip, Icon, Col, Row, List } from 'antd';


const Config = ({ projectId, selectedDb, isprimary, collections, selectedCollection, selectedRule, defaultRule, handleRuleChange, handleSelection }) => {
    const text = <span>This database is used for eventing.First change the eventing database from config section.</span>;


    return (
        <React.Fragment>
            <Topbar
                showProjectSelector
                showDbSelector
                selectedDb={selectedDb}
            />
            <div className='flex-box'>
                <Sidenav selectedItem='database' />
                <div className='db-page-content'>
                    <DBTabs
                        selectedDatabase={selectedDb}
                        activeKey='config'
                        projectId={projectId}
                    />
                    <div className="db-tab-content">
                        <ul class='config-list'>
                            <li>
                                <div><p className='config-list-title'><b>Reload Schema</b></p>
                                    <p>Refresh space cloud, typically required if you have changed the underlying database.</p>
                                    <Button className='config-list-button-grey'>RELOAD</Button></div>
                            </li>
                            <li>
                                <div><p className='config-list-title'><b>Set Up DB</b></p>
                                    <p>Modifies database as per space cloud schema , typically required if you have dropped or modified underlying database.</p>
                                    <Button className='config-list-button-grey'>SET UP</Button></div>
                            </li>
                            <li>
                                <div><p className='config-list-title'><b>Disable Database</b></p>
                                    <p>Disables all access to database.</p>
                                    {isprimary == true && (<Tooltip placement="rightTop" title={text}>
                                        <Button className='config-list-button-red' disabled>DISABLE</Button>
                                    </Tooltip>)}
                                    {isprimary == false && (<Button className='config-list-button-red'>DISABLE</Button>)}</div>
                            </li>

                        </ul>



                    </div>
                </div>
            </div> </React.Fragment>
    );
}
const mapStateToProps = (state, ownProps) => {

    const selectedDb = ownProps.match.params.database;
    const collections = get(state, `config.modules.crud.${selectedDb}.collections`, {})
    const collectionNames = Object.keys(collections).filter(col => col !== "events_log")
    let selectedCollection = get(state, `uiState.database.${selectedDb}.selectedCollection`, '')
    if (selectedCollection === '' && collectionNames.length > 0) {
        selectedCollection = collectionNames[0]
    }
    const selectedRule = selectedCollection === '' ? '' : collections[selectedCollection].rules
    return {
        isprimary: false,
        projectId: ownProps.match.params.projectId,
        selectedDb: selectedDb,
        collections: collectionNames,
        selectedCollection: selectedCollection,
        selectedRule: selectedRule
    };
};
const mapDispatchToProps = (dispatch, ownProps) => {
    const selectedDb = ownProps.match.params.database;
    return {
        handleRuleChange: (collectionName, value) => {
            dispatch(
                set(
                    `config.modules.crud.${selectedDb}.collections.${collectionName}.rules`,
                    value
                )
            );
        },
        handleSelection: collectionName => {
            dispatch(set(`uiState.database.${selectedDb}.selectedCollection`, collectionName));
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Config);
