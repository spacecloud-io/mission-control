import React, { Component } from 'react'
import { connect } from 'react-redux';
import { set, get } from 'automate-redux';
import history from "../../history";
import store from "../../store";

import { Button, Icon } from 'antd';
import DbSelector from '../../components/db-selector/DbSelector'
import SelectProject from '../../components/select-project/SelectProject'
import './topbar.css'

import logo from '../../assets/logo-black.svg';

class Topbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false
    };
  }

  handleModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    return (
      <div>
        <div className="topbar">
          <img className="logo-black" src={logo} alt="logo" />
          {this.props.showProjectSelector && <div className="btn-position">
            <Button className="btn" onClick={() => this.handleModalVisible(true)}>{this.props.projectName}
              <Icon type="caret-down" /></Button>
          </div>}
          {(this.props.showDbSelector) &&
            <DbSelector handleSelect={this.props.handleSelect} selectedDb={this.props.selectedDb} />
          }
          <SelectProject visible={this.state.modalVisible} handleCancel={() => this.handleModalVisible(false)} />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state, ownProps) => {
  return {
    selectedDb: ownProps.selectedDb,
    projectName: get(state, "config.name", "")
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleSelect(value) {
      const projectId = get(store.getState(), "config.id", "")
      history.push(`/mission-control/projects/${projectId}/database/overview/${value}`)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Topbar);