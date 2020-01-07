import React from 'react'
import Database from '../../../components/ManageServices/Database'
import { Modal } from 'antd'

const DatabaseAdd = (props) => {
    return (
        <div>
            <Modal
                title="Add Database"
                okText="Save"
                visible={true}
                onCancel={props.handleCancel}
                width="600px"
            //onOk={handleSubmit}
            >
                <Database />
            </Modal>
        </div>
    )
}

export default DatabaseAdd