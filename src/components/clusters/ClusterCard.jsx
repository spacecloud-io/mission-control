import React from 'react'
import { Card } from 'antd';
import Kubernetes from '../../assets/kubernetes.svg';
import Docker from '../../assets/docker.svg'

function ClusterCard(props) {
    const len = props.projects ? props.projects.length : 0;
    return (
        <div align="center" style={{ padding: 8 }}>
            <Card style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", height: 356 }}>
                <div align="center" style={{ padding: 45 }}>
                    {props.type === "kubernetes" ? (
                        <div>
                            <img src={Kubernetes} style={{ padding: 20 }} />
                            <div>
                                <b>{props.name}</b>
                                <p>(Kubernetes)</p>
                            </div>
                        </div>
                    ) : (
                            <div>
                                <img src={Docker} style={{ padding: 20 }} />
                                <div>
                                    <b>{props.name}</b>
                                    <p>(Docker)</p>
                                </div>
                            </div>
                        )}
                    {len === 0 ? (<h3>{`No Project in this cluster`}</h3>) : (len === 1 ? (
                        <h3>{`${len} Project in this cluster`}</h3>
                    ) : (<h3>{`${len} Projects in this cluster`}</h3>))}
                </div>
            </Card>
        </div>
    )
}

export default ClusterCard