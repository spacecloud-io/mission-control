import React, { useEffect } from 'react'
import construction from "../../assets/construction.svg"
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';

const Guides = () => {
    useEffect(() => {
		ReactGA.pageview("/projects/guides");
	}, [])

    return (
        <div>
            <Topbar showProjectSelector />
            <div>
                <Sidenav selectedItem="guides" />
                <div className="page-content">
                    <div className="panel">
                        <img src={construction} style={{ width: 550 }} />
                        <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Step by step guides for various tasks are coming soon!.Join our <a onClick={() => window.open("https://discordapp.com/invite/ypXEEBr")}>Discord channel</a> if you need any help. </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Guides