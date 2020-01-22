import React, { useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { useParams, Route } from "react-router-dom";
import routingSvg from "../../assets/routing.svg";
import { Button, Table, Divider, Popconfirm,Tag } from "antd";
import RoutingRule from "../../components/routing/routingRule";
import { useDispatch } from "react-redux";
import { set, increment, decrement} from "automate-redux";
import client from "../../client";
import { setProjectConfig, notify } from '../../utils';
import store from '../../store'
import uuidv5 from 'uuid';

function Routing() {
    const { projectID } = useParams();
    const dispatch = useDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    const [routeClicked, setRouteClicked] = useState("")

    const routes =  [{id: "fd479147-02a7-4a95-af57-68cb6eb2fd53",
    source: {hosts: ["msdkcm","dsknv","sd"],
                rewrite: "mcksd",
                url: "v1/*",
                type:"prefix"},
    dest: {host: "service1.todo_app.svc.cluster.local",
      port:"port1"}
    }];

    const routesTableData = routes.map((data, index, arr) => {
        return {id: arr[index].id, allowedHosts: arr[index].source.hosts, url: arr[index].source.url, target: arr[index].dest.host};
    })
    
    const len = routesTableData.length;
    
    const routeClickedInfo = routeClicked ?  routes.find(obj => obj.id === routeClicked): undefined 

    const handleAddRoutes = (type, urle, prefix, service, port, rewrite, hosts) => {
         const id = uuidv5();
         const host = `${service}.${projectID}.svc.cluster.local`
         const url = type === "prefix" ? `${prefix}/*` : urle 
         const source = { hosts, url, rewrite, type }
         const dest =  { host, port } 
         const routing = [{id: id, source: source, dest: dest}]
         dispatch(increment("pendingRequests"))
         client.routing.setRoutingConfig(projectID, routing).then(() => {
             dispatch(set("routing", routing ));
            // setProjectConfig(projectID, `modules.routing`, routing)
             notify("success", "Success", "Successfully added routing rule")
		}).catch(ex => notify("error", "Error", ex)).finally(() => dispatch(decrement("pendingRequests")))
    }

    const handleUpdateRoutes = (type, urle, prefix, service, port, rewrite, hosts) => {
        const id = routeClicked
        const host = `${service}.${projectID}.svc.cluster.local`
        const url = type === "prefix" ? `${prefix}/*` : urle 
        const source = { hosts, url, rewrite, type }
        const dest =  { host, port } 
        const routing = [{id: id, source: source, dest: dest}]
        dispatch(increment("pendingRequests"))
        client.routing.updateRoutingConfig(projectID, routing).then(() => {
            dispatch(set("routing", routing ));
           // setProjectConfig(projectID, `modules.routing`, routing)
            notify("success", "Success", "Successfully updated routing rule")
       }).catch(ex => notify("error", "Error", ex)).finally(() => dispatch(decrement("pendingRequests")))
    }

    const handleRouteClick = (id) => {
        dispatch(set("routing", routes))
        setRouteClicked(id)
        setModalVisible(true)
    }
    
    const handleDelete = (id) => {
        dispatch(increment("pendingRequests"))
        client.routing.deleteRoutingConfig(projectID, id).then(() => {
            const newRoutes = routes.filter(route => route.id !== id)
            setProjectConfig(projectID, `modules.routing`, newRoutes)
            dispatch(set("routing", newRoutes))
            notify("success", "Success", "Deleted rule successfully")
        }).catch(ex => notify("error", "Error", ex))
          .finally(() => dispatch(decrement("pendingRequests")))
    }

    const handleModalCancel = () => {
        setRouteClicked("")
        setModalVisible(false)
    }

    const columns = [
        {
            title: <b>{'Allowed Hosts'}</b>,
            dataIndex: 'allowedHosts',
            key: 'allowedHosts',
            render: allowedHosts => (
                <span>
                  {allowedHosts.map(hosts => {
                    return (
                      <Tag key={hosts}>
                          {hosts}
                      </Tag>
                    );
                  })}
                </span>
              ),
        },
        {
            title: <b>{'Request URL'}</b>,
            dataIndex: 'url',
            key: 'url',
        },
        {
            title: <b>{'Target'}</b>,
            dataIndex: 'target',
            key: 'target',
        },
        {
            title: <b>{'Actions'}</b>,
            className: 'actions',
            render: (_, record) => {
                return (
                    <span>
                        <a style={{ color: "#40A9FF" }} onClick={() => {
                            handleRouteClick(record.id)
                        }}>Edit</a>
                        <Popconfirm title={`This will delete all the data. Are you sure?`} onConfirm={() => handleDelete(record.id)}>
                            <a style={{ color: "red", paddingLeft: 10 }}>Delete</a>
                        </Popconfirm>
                    </span>
                )
            }
        }

    ]

    const data = [
        {
            key: '1',
            AllowedHosts: 'All',
            RequestURL: 'v1/',
            target: 'service/v1/*',
        },
        {
            key: '2',
            AllowedHosts: 'SpaceUpTech.com',
            RequestURL: 'v1/',
            target: 'service2/v1/*',
        },
    ]

    

    return (
        <div>
            <Topbar showProjectSelector />
            <div>
                <Sidenav selectedItem="routing" />
                <div className="page-content">
                    {len === 0 &&
                        <div className="panel">
                            <img src={routingSvg} style={{ height: 300 }} />
                            <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>No routes created yet. Create a routing rule to expose your deployments to the outer world.</p>
                            <Button type="primary" style={{ marginTop: 16 }} onClick={() => setModalVisible(true)}>
                                Create your first route
						</Button>
                        </div>
                    }
                    {len > 0 && <React.Fragment>
                        <h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>Routing rules <Button type="primary" onClick={() => setModalVisible(true)}>Add</Button></h3>
                        <Table columns={columns} dataSource={routesTableData} bordered />
                    </React.Fragment>}
                </div>
                {modalVisible && <RoutingRule
                    handleSubmit={handleAddRoutes}
                    handleUpdate={handleUpdateRoutes}
                    initialValues={routeClickedInfo}
                    handleCancel={handleModalCancel} />}
            </div>
        </div>
    )
}

export default Routing