import React, { useEffect } from 'react'
import construction from "../../assets/construction.svg"
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';

function Plans() {
    useEffect(() => {
		ReactGA.pageview("/projects/plans");
    }, [])
    
    return (
        <div>
            <Topbar showProjectSelector />
            <div>
                <Sidenav selectedItem="billing" />
                <div className="page-content">
                    <div className="panel">
                        <img src={construction} style={{ width: 550 }} />
                        <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Space Cloud Pro is coming soon! Stay tuned.Join our <a onClick={() => window.open("https://discordapp.com/invite/ypXEEBr")}>Discord channel</a> to know more. </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Plans