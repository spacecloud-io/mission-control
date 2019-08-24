import React from 'react';
import ReactGA from 'react-ga';
import './rules.css';

// pages
import DBOverview from './db-overview/DBOverview';
import DBRules from './db-rules/DBRules';
import DBSchema from './db-schema/DBSchema';

// antd
import { Tabs } from 'antd';
const { TabPane } = Tabs;

export default class Rules extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalVisible: false };
    this.handleModalVisiblity = this.handleModalVisiblity.bind(this);
  }

  componentDidMount() {
    ReactGA.pageview('/projects/database/rules');
  }

  handleModalVisiblity(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    console.log(this.props.rules);
    return (
      <div>
        <Tabs defaultActiveKey='1' onChange={this.callback}>
          <TabPane
            tab='Overview'
            key='1'
          >
            <DBOverview
              match={this.props.match}
              rules={this.props.rules}
              updateFormState={this.props.updateFormState}
              formState={this.props.formState}
            />
          </TabPane>
          <TabPane
            tab='Rules'
            key='2'
          >
            <DBRules match={this.props.match} rules={this.props.rules} />
          </TabPane>
          <TabPane
            tab='Schema'
            key='3'
          >
            <DBSchema match={this.props.match} rules={this.props.rules}/>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
