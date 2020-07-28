import React from "react";
import qs from 'qs';
import { Result } from "antd";
import ProjectPageLayout, { Content } from "../../components/project-page-layout/ProjectPageLayout";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { useLocation } from "react-router-dom";

function NoPermissions() {
  const location = useLocation()
  const { moduleId } = qs.parse(location.search, { ignoreQueryPrefix: true });
  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={moduleId} />
      <ProjectPageLayout>
        <Content>
          <Result
            status="403"
            subTitle="Sorry, you are not authorized to access this page. Contact your admin to grant you permissions"
          />
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  )
}

export default NoPermissions