import React from "react";
import { Card } from "antd";
import githubSvg from "../../../assets/githubIcon.svg";
import "./github.css";

const GithubCard = () => {
  return (
    <Card className="github-card">
      <h2>Bugs/feature-requests?</h2>
      <p>
        Create an issue on Github for any bugs or feature requests that you
        might have. We would love to ship them in the next release!
      </p>
      <a
        href="https://github.com/spaceuptech/space-cloud/issues/new/choose"
        target="_blank"
      >
        <button className="github-btn">
          <img src={githubSvg} style={{ marginRight: "2%" }} /> Create a github
          issue
        </button>
      </a>
    </Card>
  );
};

export default GithubCard;
