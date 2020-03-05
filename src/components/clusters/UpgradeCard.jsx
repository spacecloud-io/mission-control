import React from 'react'
import { Card, Button } from 'antd';
import upgradeSvg from '../../assets/upgrade.svg';

function UpgradeCard(props) {
    return (
        <div align="center" style={{ padding: 8 }}>
            <Card style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}>
                <img src={upgradeSvg} />
                <div>
                    <h3><b>Upgrade for more clusters</b></h3>
                    <h4>Open source plan allows only 1 clusters</h4>
                    <Button type="primary" className="upgrade-btn">Upgrade</Button>
                </div>
            </Card>
        </div>
    )
}

export default UpgradeCard