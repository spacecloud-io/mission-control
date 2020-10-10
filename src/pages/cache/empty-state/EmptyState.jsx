import React from "react";
import { useParams, Redirect } from "react-router-dom";
import { Button } from "antd";
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { projectModules } from "../../../constants";
import addCache from "../../../assets/cache.svg";
import history from "../../../history";

const EmptyState = () => {
    const { projectID } = useParams();

    if (true) {	
        return <Redirect to={`/mission-control/projects/${projectID}/cache/overview`} />;	
      }

    return (
        <React.Fragment>
            <Topbar showProjectSelector />
            <Sidenav selectedItem={projectModules.CACHE} />
            <ProjectPageLayout>
                <Content>
                    <div className="panel">
                        <img src={addCache} style={{width: "auto"}} />
                        <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>
                            Improve your app performance by caching database query results via Space Cloud’s caching module
                        </p>
                        <Button type="primary action-rounded" style={{ marginTop: 16, padding: "0px 42px" }} onClick={() => history.push(`/mission-control/projects/${projectID}/cache/add-cache`)}>
                            Enable Caching
                        </Button>
                    </div>
                </Content>
            </ProjectPageLayout>
        </React.Fragment>
    )
}

export default EmptyState;