import { useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Space, Switch, Table, Tag, message } from 'antd'
import useBranchStore, { type Branch } from '../../store/branch'
import { request } from '../../utils/api'

const BranchesPage = () => {
  const { branches, load } = useBranchStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Branch>()
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<{ code: string; name: string; enableCreditControl: boolean; totalCreditLimit: number }>()
  const edit = (branch?: Branch) => {
    setEditing(branch)
    form.resetFields()
    form.setFieldsValue(branch ?? { code: '', name: '', enableCreditControl: false, totalCreditLimit: 0 })
    setOpen(true)
  }
  const save = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editing) await request.put(`/branches/${editing.id}`, values)
      else await request.post('/branches', values)
      setOpen(false)
      message.success('Branch saved')
      await load()
    } catch (error) {
      message.error(error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unable to save branch')
    } finally { setSaving(false) }
  }
  return (
    <>
      <Space style={{ marginBottom: 16 }}><h2 style={{ margin: 0 }}>Branches</h2><Button type="primary" onClick={() => edit()}>New Branch</Button></Space>
      <Table rowKey="id" dataSource={branches} columns={[
        { title: 'Branch Code', dataIndex: 'code' },
        { title: 'Branch Name', dataIndex: 'name' },
        { title: 'Credit Control', dataIndex: 'enableCreditControl', render: value => <Tag color={value ? 'processing' : 'default'}>{value ? 'Enabled' : 'Disabled'}</Tag> },
        { title: 'Total Credit Limit', dataIndex: 'totalCreditLimit', render: value => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { title: 'Actions', render: (_, branch) => <Button type="link" onClick={() => edit(branch)}>Edit</Button> },
      ]} />
      <Modal title={editing ? 'Edit Branch' : 'New Branch'} open={open} confirmLoading={saving} onOk={() => { void save() }} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Branch Code" rules={[
            { required: true, whitespace: true },
            { pattern: /^[A-Za-z0-9]+$/, message: 'Use letters and numbers only' },
          ]}><Input maxLength={20} onInput={event => { event.currentTarget.value = event.currentTarget.value.toUpperCase() }} /></Form.Item>
          <Form.Item name="name" label="Branch Name" rules={[{ required: true, whitespace: true }]}><Input maxLength={200} /></Form.Item>
          <Form.Item name="enableCreditControl" label="Credit Control" valuePropName="checked"><Switch checkedChildren="Enabled" unCheckedChildren="Disabled" /></Form.Item>
          <Form.Item name="totalCreditLimit" label="Total Credit Limit" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} step={1000} prefix="$" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default BranchesPage
