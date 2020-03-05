import React from 'react'
import { Card, Button, Icon } from 'antd';
const { Meta } = Card;
function RegisterCard(props) {
    return (
        <div style={{ padding: 8 }}>
            <Card hoverable bodyStyle={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", margin: 0, padding: 0, height: 354 }}
                onClick={() => props.popup(true)}>
                <div align="center" style={{ height: 314, paddingTop: 100 }}>
                    <Icon type="plus" style={{ fontSize: 60, paddingBottom: 20 }} />
                    <h3>Register an existing cluster</h3>
                </div>
                <div align="center" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#002C39", height: 40 }}>
                    <div style={{ paddingTop: 10 }}>
                        <a href="https://docs.spaceuptech.com/" target="_blank">Create a new Cluster</a>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default RegisterCard