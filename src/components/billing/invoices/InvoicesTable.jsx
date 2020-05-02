import React from 'react';
import { Table, Card } from 'antd';

const InvoicesTable = ({ invoices }) => {
  const columns = [
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
      render: (_, record) => {
        var start = new Date(record.period.start * 1000)
        var end = new Date(record.period.end * 1000)
        return `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()} to 
            ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`
      }
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => `$${record.amount}`
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        if (record.status === "paid") {
          return <span style={{ color: "#15CD72" }}>{record.status}</span>
        } else if (record.status === "uncollectible") {
          return <span style={{ color: "#F5222D" }}>{record.status}</span>
        } else {
          return record.status
        }

      }
    },
    {
      title: "",
      dataIndex: "invoice_pdf",
      key: "invoice_pdf",
      render: (_, record) => {
        return <a href={`${record.invoice_pdf}`} target="_blank">Download Invoice</a>
      }
    }
  ]

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={invoices}
      />
    </Card>
  );
}

export default InvoicesTable;