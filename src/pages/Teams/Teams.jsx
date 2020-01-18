import React from 'react'
import construction from "../../assets/construction.svg"
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';

function Teams() {
    return (
        <div>
            <Topbar showProjectSelector />
            <div>
                <Sidenav selectedItem="teams" />
                <div className="page-content">
                    <div className="panel">
                        <img src={construction} style={{ width: 550 }} />
                        <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Team collaboration feature is coming soon.Join our <a onClick={() => window.open("https://discordapp.com/invite/ypXEEBr")}>Discord channel</a> to know more about it. </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Teams