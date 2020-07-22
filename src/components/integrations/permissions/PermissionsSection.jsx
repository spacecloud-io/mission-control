import React, { useState } from 'react';
import { Divider, Radio, Table, Empty } from 'antd';
import upLogo from '../../../logo.png';
import { CheckOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import { configResourceTypeLabels, apiResourceTypeLabels } from '../../../constants';

const PermissionIcon = ({ allowed }) => {
  if (allowed) {
    return <CheckOutlined style={{ color: '#52C41A' }} />
  } else {
    return <CloseOutlined style={{ color: '#FF4D4F' }} />
  }
}

const PermissionsSection = ({ configPermissions, apiPermissions, name, imgUrl, scrollHeight }) => {

  const [permissionsType, setPermissionsType] = useState('config');

  const configColumns = [
    {
      title: 'Config resource',
      render: (_, record) => configResourceTypeLabels[record.resource]
    },
    {
      title: 'Read',
      align: "center",
      render: (_, record) => <PermissionIcon allowed={record.read} />
    },
    {
      title: 'Modify',
      align: "center",
      render: (_, record) => <PermissionIcon allowed={record.modify} />
    },
    {
      title: 'Webhook',
      align: "center",
      render: (_, record) => <PermissionIcon allowed={record.hook} />
    },
    {
      title: 'Override',
      align: "center",
      render: (_, record) => <PermissionIcon allowed={record.hijack} />
    }
  ];

  const apiColumns = [
    {
      title: 'API',
      key: 'resource',
      render: (_, record) => apiResourceTypeLabels[record.resource]
    },
    {
      title: 'Access',
      align: "center",
      render: (_, record) => <PermissionIcon allowed={record.access} />
    },
    {
      title: 'Webhook',
      align: "center",
      render: (_, record) => <PermissionIcon allowed={record.hook} />
    },
    {
      title: 'Override',
      align: "center",
      render: (_, record) => <PermissionIcon allowed={record.hijack} />
    }
  ];

  return (
    <React.Fragment>
      <center>
        <div style={{ display: "inline-flex", alignItems: "center" }}>
          <img src={imgUrl} style={{ height: 48, width: 48 }} />
          <SwapOutlined style={{ fontSize: '32px', margin: '0px 16px' }} />
          <img src={upLogo} style={{ height: 48, width: 48 }} />
        </div>
        <h3>{name} requires the following permissions</h3>
      </center>
      <Divider />
      <Radio.Group value={permissionsType} size="medium" onChange={(e) => setPermissionsType(e.target.value)}>
        <Radio.Button value="config">Config permissions</Radio.Button>
        <Radio.Button value="api">API permissions</Radio.Button>
      </Radio.Group>
      <Table
        size="middle"
        style={{ marginTop: 24 }}
        columns={permissionsType === "config" ? configColumns : apiColumns}
        dataSource={permissionsType === "config" ? configPermissions : apiPermissions}
        bordered scroll={scrollHeight ? { y: 240 } : undefined}
        pagination={false}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`No ${permissionsType} permissions required`} /> }} />
    </React.Fragment>
  );
}

export default PermissionsSection;