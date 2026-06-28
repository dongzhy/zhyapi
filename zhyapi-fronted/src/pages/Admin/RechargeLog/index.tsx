import { PageContainer, ProTable, ProForm, ProFormNumber, ProFormDateRangePicker } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {listRechargeLogUsingPost} from '@/services/zhyapi_backed/userInterfaceInfoController';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import type { UserRechargeLogQueryRequest, UserInterfaceRechargeLogVO } from '@/services/zhyapi_backed/typings';

export default function RechargeLogPage() {
  // 表格请求
  const tableRequest = async (params: UserRechargeLogQueryRequest) => {
    const res = await listRechargeLogUsingPost(params);
    return {
      data: res.data.records,
      total: res.data.total,
      success: true,
    };
  };

  const columns = [
    { title: '流水ID', dataIndex: 'id', width: 80, hideInSearch: true },
    { title: '操作管理员', dataIndex: 'operateUserName', width: 120, hideInSearch: true },
    { title: '操作用户ID', dataIndex: 'targetUserId', width: 100, valueType: 'digit' },
    { title: '操作用户账号', dataIndex: 'targetUserName', width: 120, hideInSearch: true },
    { title: '接口ID', dataIndex: 'interfaceInfoId', width: 100, valueType: 'digit' },
    { title: '接口名称', dataIndex: 'interfaceName', width: 180, hideInSearch: true },
    {
      title: '变更次数',
      dataIndex: 'changeNum',
      width: 100,
      hideInSearch: true,
      render: (val: number) => {
        if (val > 0) return <Tag color="success">+{val}</Tag>;
        return <Tag color="error">{val}</Tag>;
      },
    },
    { title: '操作前剩余', dataIndex: 'beforeLeftNum', width: 100, hideInSearch: true },
    { title: '操作后剩余', dataIndex: 'afterLeftNum', width: 100, hideInSearch: true },
    { title: '备注', dataIndex: 'remark', ellipsis: true, hideInSearch: true },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      width: 180,
      hideInSearch: true,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <PageContainer title="调用次数变更流水对账">
      <ProTable<UserInterfaceRechargeLogVO, UserRechargeLogQueryRequest>
        rowKey="id"
        request={tableRequest}
        columns={columns}
        pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }}
        search={{
          labelWidth: 'auto',
        }}
        form={{
          initialValues: {},
        }}
      >
        <ProForm.Group>
          <ProFormNumber name="targetUserId" label="操作用户ID" placeholder="筛选指定用户" />
          <ProFormNumber name="interfaceId" label="接口ID" placeholder="筛选指定接口" />
          <ProFormDateRangePicker name="timeRange" label="操作时间" transform={(val) => ({
            startTime: val?.[0],
            endTime: val?.[1],
          })} />
        </ProForm.Group>
      </ProTable>
    </PageContainer>
  );
}
