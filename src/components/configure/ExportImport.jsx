import React from 'react'
import { Upload, message, Form, Select, Input, Button } from 'antd';
import { Icon } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setProjectConfig, getProjectConfig, notify } from '../../utils';
import { useParams } from "react-router-dom";

const YAML = require('yamljs');

const ExportImport = ({ projectConfig, importProjectConfig }) => {
    const { projectID, selectedDB } = useParams()

    const projects = useSelector(state => state.projects)
    const projectName = getProjectConfig(projects, projectID, "name")

    const download = (e, type) => {
        e.preventDefault();
        var data = ""
        if (type === "json") {
            data = new Blob([JSON.stringify(projectConfig, null, 2)], { type: 'content-type/json' });
        }
        if (type === "yaml") {
            const yamlString = YAML.stringify(projectConfig, 10, 2);
            data = new Blob([yamlString], { type: 'text/yaml' });
        }
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${projectID}.${type}`);
        link.click();

    }

    const importFiles = (info, type) => {
        if (info.fileList.length > 0) {
            var file = info.fileList[0].originFileObj
            const reader = new FileReader();
            reader.onload = function () {
                const getdata = reader.result
                try {
                    const dataObj = type === "json" ? JSON.parse(getdata) : YAML.parse(getdata)
                    importProjectConfig(projectID, { secret: dataObj.secret, id: projectID, name: projectName, modules: dataObj.modules })
                } catch (err) {
                    notify("error", "Error uploading file", "Unsupported syntax error");
                }
            };
            reader.onerror = function () {
                notify("error", "Error uploading file", reader.error.toString())
            };
            reader.readAsBinaryString(file)
        }
    };

    return (
        <div>
            <p>Download project config in JSON/YAML file </p>
            <Form layout="inline">
                <Form.Item>
                    <Button onClick={(e) => download(e, "yaml")}>
                        Yaml
                        <Icon type="download" />
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button onClick={(e) => download(e, "json")}>
                        Json
                        <Icon type="download" />
                    </Button>
                </Form.Item>
            </Form>
            <p>Update project config by importing a JSON/YAML files</p>
            <Form layout="inline">
                <Form.Item>
                    <Upload onChange={(info) => importFiles(info, "yaml")} accept=".yaml" beforeUpload={file => false}>
                        <Button>
                            <Icon type="upload" /> Yaml
                    </Button>
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Upload onChange={(info) => importFiles(info, "json")} accept=".json" beforeUpload={file => false}>
                        <Button>
                            <Icon type="upload" /> Json
                    </Button>
                    </Upload>
                    <div></div>
                </Form.Item>
            </Form>
        </div>
    )
}

export default Form.create({})(ExportImport);