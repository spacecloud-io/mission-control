import React from 'react';
import { Table } from 'antd';

const Invoice = () => {
    const columns = [
        {
          title: "Period",
          dataIndex: "period",
          key: "period"
        },
        {
          title: "Amount",
          dataIndex: "amount",
          key: "amount",
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
        },
        {
          title: "Invoice PDF",
          dataIndex: "invoicePdf",
          key: "invoicePdf",
        }
    ]    

    const data =[
        {
            key: "1",
            period: "25/10/2019 to 25/11/2019",
            amount: "$199",
            status: "paid",
            invoicePdf: "Download"
        },
        {
            key: "1",
            period: "25/10/2019 to 25/11/2019",
            amount: "$199",
            status: "paid",
            invoicePdf: "Download"
        },
        {
            key: "1",
            period: "25/10/2019 to 25/11/2019",
            amount: "$199",
            status: "paid",
            invoicePdf: "Download"
        }
    ]
    return(
        <Table 
            columns={columns} 
            dataSource={data} 
            bordered={true} 
        />
    );
}

export default Invoice;