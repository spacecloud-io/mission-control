import React from 'react';
import { Card, Button } from 'antd';
import crown from '../../../assets/crown.svg'

const PlanDetails = ({ databases, projects, clusters, handleIncreaseLimit }) => {
    if (databases === undefined || databases === null) databases = 1
    if (projects === undefined || projects === null) projects = 1
    if (clusters === undefined || clusters === null) clusters = 1
    return (
        <div>
            <h3 style={{marginTop:"40px", marginBottom:"24px", fontSize:"21px"}}>Cluster details</h3>
            <Card>
                <h1 style={{ marginBottom: 0 }}><b> Pro plan</b> <img src={crown} /></h1>
                <p style={{ marginTop: 0 }}>$99/month</p>
                <p style={{ marginTop: "5%" }}><b>Details:</b></p>
                <p>Project limits: {projects} {projects === 1 ? "project" : "projects"}</p>
                <p style={{ marginBottom: "10%" }}>Database limits: {databases} {databases === 1 ? "database" : "databases"}</p>
                <Button type='primary' style={{ width: "100%" }} onClick={handleIncreaseLimit}>Increase cluster limits</Button>
            </Card>
        </div>
    );
}

export default PlanDetails;