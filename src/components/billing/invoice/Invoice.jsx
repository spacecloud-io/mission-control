import React from 'react';
import { Table } from 'antd';
import { useSelector } from 'react-redux';

const Invoice = () => {

    const invoiceData = useSelector(state => state.billing.invoices)
    const columns = [
        {
          title: "Period",
          dataIndex: "period",
          key: "period",
          render: (_, record) => {
            var start = new Date(record.period.start*1000)
            var end = new Date(record.period.end*1000)
            return `${start.getDate()}/${start.getMonth()+1}/${start.getFullYear()} to 
            ${end.getDate()}/${end.getMonth()+1}/${end.getFullYear()}`
          }
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
          render: (_, record) => {
             if(record.status === "paid"){
              return <span style={{color:"#15CD72"}}>{record.status}</span>
             } else if(record.status === "uncollectible"){
              return <span style={{color:"#F5222D"}}>{record.status}</span>
             } else{
               return record.status
             }

          }
        },
        {
          title: "Invoice PDF",
          dataIndex: "invoice_pdf",
          key: "invoice_pdf",
          render: (_, record) => {
            return <a href={`${record.invoice_pdf}`} target="_blank">Download</a>
          }
        }
    ]    

    const data =[
        {
            key: "1",
            period: "25/10/2019 to 25/11/2019",
            amount: "$199",
            status: "paid",
            invoice_pdf: "http://google.com"
        },
        {
            key: "1",
            period: "25/10/2019 to 25/11/2019",
            amount: "$199",
            status: "paid",
            invoice_pdf: "Download"
        },
        {
            key: "1",
            period: "25/10/2019 to 25/11/2019",
            amount: "$199",
            status: "paid",
            invoice_pdf: "Download"
        }
    ]
    return(
        <Table 
            columns={columns} 
            dataSource={invoiceData} 
            bordered={true} 
        />
    );
}

export default Invoice;