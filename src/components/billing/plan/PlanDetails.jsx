import React from 'react';
import { Card, Button } from 'antd';
import crown from '../../../assets/crown.svg'

const PlanDetails = ({ databases, projects, clusters, handleIncreaseLimit }) => {
    if (databases === undefined || databases === null) databases = 1
    if (projects === undefined || projects === null) projects = 1
    if (clusters === undefined || clusters === null) clusters = 1
    return (
        <Card>
            <h1 style={{ marginBottom: 0 }}><b>Space Cloud Pro</b> <img src={crown} style={{ marginLeft: "5%" }} /></h1>
            <p style={{ marginTop: 0 }}>$199/month</p>
            <p style={{ marginTop: "5%" }}><b>Details:</b></p>
            <p>Database limits: {databases} {databases === 1 ? "database" : "databases"}</p>
            <p>Project limits: {projects} {projects === 1 ? "project" : "projects"}</p>
            <p style={{ marginBottom: "10%" }}>Cluster limits: {clusters} {clusters === 1 ? "cluster" : "clusters"}</p>
            <Button type='primary' style={{ width: "100%" }} onClick={handleIncreaseLimit}>Increase limits</Button>
        </Card>
    );
}

export default PlanDetails;