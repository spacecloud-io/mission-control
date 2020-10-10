import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "antd";
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout"
import { projectModules } from "../../../constants";
import ConfigCard from "../../../components/cache/config-card/ConfigCard";
import { ArrowRightOutlined } from "@ant-design/icons";

const dummyValues = {
    connected: false,
    conn: "redis.svc.cluster.local:6379"
}
const Overview = () => {
    const history = useHistory();
    return (
        <React.Fragment>
            <Topbar showProjectSelector />
            <Sidenav selectedItem={projectModules.CACHE} />
            <ProjectPageLayout>
                <Content>
                    <p style={{ fontSize: 16, marginBottom: 16 }}>Caching Config</p>
                    <ConfigCard values={dummyValues}/>
                    <p style={{ fontSize: 16, marginTop: 32, marginBottom: 16 }}>Actions</p>
                    <div className="config-card" style={{maxWidth: 783}}>
                        <p style={{ marginBottom: 24, fontSize: 14 }}>
                            <b>Purge cache</b><br />
                            <p>Purge cache of all or particular tables. You might want to purge  cache in dev environment especifically for debugging.</p>
                        </p>
                        <Button className="disable-btn" onClick={() => history.push("/mission-control/projects/mockproject1/cache/purge-cache")}>Purge cache <ArrowRightOutlined /></Button>
                    </div>
                </Content>
            </ProjectPageLayout>
        </React.Fragment>
    )
}

export default Overview