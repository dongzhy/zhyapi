import { PageContainer, ProTable } from '@ant-design/pro-components';
// ✅ 1. 导入 Input 组件，而不是 TextArea
import { message, Button, Modal, Form, InputNumber, Input } from 'antd';
import type {
  UserInterfaceInfo,
  UserInterfaceInfoQueryRequest,
  UserInterfaceInfoRechargeRequest
} from '@/services/zhyapi_backed/typings';
import { useState, useRef } from 'react';
import {
  batchRechargeInterfaceCountUsingPost,
  listUserInterfaceInfoByPageUsingPost
} from "@/services/zhyapi_backed/userInterfaceInfoController";

export default function UserInterfaceAdminPage() {
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const actionRef = useRef<any>(null);
  const [selectedRows, setSelectedRows] = useState<UserInterfaceInfo[]>([]);
  const [formIns] = Form.useForm();

  const tableRequest = async (params: UserInterfaceInfoQueryRequest) => {
    const res = await listUserInterfaceInfoByPageUsingPost(params);
    return {
      data: res.data?.records ?? [],
      total: res.data?.total ?? 0,
      success: true,
    };
  };

  const onSubmitRecharge = async () => {
    try {
      // 1. 校验表单
      const formValues = await formIns.validateFields();

      // 2. 构造数据
      const userIdList = selectedRows.map(item => item.userId);
      const submitData: UserInterfaceInfoRechargeRequest = {
        userIdList,
        interfaceId: formValues.interfaceId,
        addNum: formValues.addNum,
        remark: formValues.remark || ''
      };

      // 3. 发起请求
      await batchRechargeInterfaceCountUsingPost(submitData);

      // 4. 成功提示与重置
      message.success('批量充值完成');
      setBatchModalOpen(false);
      formIns.resetFields();
      setSelectedRows([]);
      actionRef.current?.clearSelected();
      actionRef.current?.reload();

    } catch (err: any) {
      // ✅ 核心修复：安全地获取错误信息
      // 优先取后端返回的业务错误信息，如果没有则取系统默认错误，最后兜底显示 '未知错误'
      const errorMsg = err?.response?.data?.message || err?.message || '充值失败，请检查网络或联系管理员';
      message.error(errorMsg);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80, hideInSearch: true },
    { title: '用户ID', dataIndex: 'userId', width: 100, valueType: 'digit' },
    { title: '接口ID', dataIndex: 'interfaceInfoId', width: 100, valueType: 'digit' },
    { title: '总调用次数', dataIndex: 'totalNum', width: 100, hideInSearch: true },
    { title: '剩余调用次数', dataIndex: 'leftNum', width: 100, hideInSearch: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        0: { text: '正常', status: 'Success' },
        1: { text: '禁用', status: 'Error' },
      },
    },
    { title: '创建时间', dataIndex: 'createTime', width: 180, hideInSearch: true },
  ];

  return (
    <PageContainer title="用户接口额度管理（管理员）">
      <ProTable<UserInterfaceInfo, UserInterfaceInfoQueryRequest>
        actionRef={actionRef}
        rowKey="id"
        request={tableRequest}
        columns={columns}
        pagination={{ pageSize: 10 }}
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => {
          const nodes: React.ReactElement[] = [];
          if (selectedRows.length > 0) {
            nodes.push(
              <Button
                key="batch-recharge-btn"
                type="primary"
                onClick={() => setBatchModalOpen(true)}
              >
                批量充值选中接口
              </Button>
            );
          }
          return nodes;
        }}
        rowSelection={{
          onChange: (_keys, rows) => setSelectedRows(rows)
        }}
      />

      <Modal
        title="批量充值"
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        onOk={onSubmitRecharge}
        maskClosable={false}
      >
        <Form form={formIns} layout="vertical">
          <Form.Item
            name="interfaceId"
            label="目标接口ID"
            rules={[{ required: true, message: '请输入接口ID' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="输入接口ID" />
          </Form.Item>
          <Form.Item
            name="addNum"
            label="充值次数"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="充值次数" />
          </Form.Item>
          <Form.Item name="remark" label="操作备注">
            {/* ✅ 2. 使用 Input.TextArea 替换 TextArea */}
            <Input.TextArea rows={3} placeholder="填写充值备注，用于流水对账" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
