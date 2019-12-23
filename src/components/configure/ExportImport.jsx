import React, { useState } from 'react'
import { Upload, message, Form, Select, Input, Button } from 'antd';
import { Icon } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setProjectConfig, getProjectConfig, notify } from '../../utils';
import { useParams } from "react-router-dom";
import { get, set, increment, decrement } from 'automate-redux';
import client from "../../client"


const YAML = require('yamljs');
const yaml = require('js-yaml');

const ExportImport = ({ object }) => {
    const { projectID, selectedDB } = useParams()
    const [Type, setType] = useState('');
    const dispatch = useDispatch()


    const projects = useSelector(state => state.projects)
    const projectName = getProjectConfig(projects, projectID, "name")

    const downLoadJson = e => {
        e.preventDefault();

        const data = new Blob([JSON.stringify(object)], { type: 'content-type/json' });
        const jsonURL = window.URL.createObjectURL(data);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonURL;
        jsonLink.setAttribute('download', 'config.json');
        jsonLink.click();

    }
    const downLoadYaml = e => {
        e.preventDefault();
        const nativeObject = YAML.parse(JSON.stringify(object));
        const yamlString = YAML.stringify(nativeObject, 4);
        const data = new Blob([yamlString], { type: 'text/yaml' });
        const yamlURL = window.URL.createObjectURL(data);
        const yamlLink = document.createElement('a');
        yamlLink.href = yamlURL;
        yamlLink.setAttribute('download', 'config.yaml');
        yamlLink.click();

    }

    const importFiles = info => {

        var file = info.fileList[0].originFileObj;
        var extension = info.fileList[0].name.split('.').pop()
        console.log(Type);
        console.log(extension);
        const reader = new FileReader();
        reader.onload = function () {
            const getdata = reader.result
            if (Type === "json" && extension === "json") {
                const jsonObj = JSON.parse(getdata);
                dispatch(increment("pendingRequests"))
                client.projects.importFiles(projectID, { secret: jsonObj.secret, id: projectID, name: projectName, modules: jsonObj.modules })
                    .then(() => {
                        setProjectConfig(projects, projectID, "modules", jsonObj.modules);
                        setProjectConfig(projects, projectID, "secret", jsonObj.secret)
                        notify("success", "Success", "File uploaded successfully")
                    })
                    .catch(ex => notify("error", "Error", ex))
                    .finally(() => dispatch(decrement("pendingRequests")))
                setType("");
            }
            if (Type === "yaml" && extension === "yaml") {
                const yamlObj = yaml.safeLoad(getdata);
                dispatch(increment("pendingRequests"))
                client.projects.importFiles(projectID, { secret: yamlObj.secret, id: projectID, name: projectName, modules: yamlObj.modules })
                    .then(() => {
                        setProjectConfig(projects, projectID, "modules", yamlObj.modules);
                        setProjectConfig(projects, projectID, "secret", yamlObj.secret)
                        notify("success", "Success", "File uploaded successfully")
                    })
                    .catch(ex => notify("error", "Error", ex))
                    .finally(() => dispatch(decrement("pendingRequests")))
                setType("");
            }
        };

        reader.onerror = function () {
            console.log(reader.error);
        };
        reader.readAsBinaryString(file);

    };


    return (
        <div>
            <p>Download project config in JSON/YAML file </p>
            <Form layout="inline">
                <Form.Item>
                    <Button onClick={downLoadYaml}>
                        Yaml
                        <Icon type="download" />
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button onClick={downLoadJson}>
                        Json
                        <Icon type="download" />
                    </Button>
                </Form.Item>
            </Form>
            <p>Update project config by importing a JSON/YAML files</p>
            <Form layout="inline">
                <Form.Item>
                    <Upload onChange={importFiles}>
                        <Button onClick={() => setType('yaml')}>
                            <Icon type="upload" /> Yaml
                    </Button>
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Upload onChange={importFiles}>
                        <Button onClick={() => setType('json')}>
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